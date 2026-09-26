import sqlite3
from datetime import datetime, timedelta
from unittest.mock import MagicMock

import pytest

import app as soma_app
import coins
import database
from conftest import PHONE, STUDENT_CODE, credit_ksh

GRADE = "cbc-7"
COVERED = "cbc-7-english-topical-1"
OTHER_GRADE = "cbc-8-english-topical-1"


@pytest.fixture
def student(client):
    """Registered in cbc-7 with no coins, so unlocks need KSh or a subscription."""
    client.post("/api/students/register", json={
        "soma_hub_code": STUDENT_CODE,
        "name": "Test Student",
        "school_name": "Test School",
        "grade": GRADE,
    })
    client.post("/api/account/import", json={"soma_hub_code": STUDENT_CODE, "coins": 0})
    return client


@pytest.fixture
def stk_ok(monkeypatch):
    def fake_post(url, json=None, headers=None, timeout=None):
        response = MagicMock()
        response.status_code = 200
        response.json.return_value = {
            "ResponseCode": "0",
            "CheckoutRequestID": "ws_CO_1",
            "MerchantRequestID": "MR_1",
        }
        return response

    monkeypatch.setattr(soma_app.requests, "post", fake_post)
    monkeypatch.setattr(soma_app, "MPESA_ENVIRONMENT", "sandbox")


def subscribe(client, request_id="sub-req-0001"):
    return client.post("/api/subscriptions", json={
        "soma_hub_code": STUDENT_CODE,
        "request_id": request_id,
    })


def unlock(client, material_id=COVERED):
    return client.post("/api/unlocks", json={
        "soma_hub_code": STUDENT_CODE,
        "material_id": material_id,
    })


def account(client):
    return client.get(f"/api/account/{STUDENT_CODE}").get_json()


def expire_subscriptions():
    conn = soma_app.get_db()
    conn.execute("UPDATE subscriptions SET expires_at = '2000-01-01 00:00:00'")
    conn.commit()
    conn.close()


def days_from_now(expires_at):
    delta = datetime.strptime(expires_at, "%Y-%m-%d %H:%M:%S") - datetime.now()
    return round(delta.total_seconds() / 86400)


def pay_with_mpesa(client, amount, purpose):
    session_id = client.post("/api/mpesa/payment-session", json={
        "soma_hub_code": STUDENT_CODE,
        "phone_number": PHONE,
        "amount": amount,
        "purpose": purpose,
    }).get_json()["session_id"]
    client.post(f"/api/dev/test-payment/{session_id}")
    return client.get(f"/api/mpesa/payment-status/{session_id}").get_json()


# ------------------------------------------------------------
# Subscribing from the wallet
# ------------------------------------------------------------

def test_subscribe_from_wallet(student):
    credit_ksh(150)

    data = subscribe(student).get_json()

    assert data["ksh_spent"] == coins.SUBSCRIPTION_PRICE_KSH
    assert data["ksh"] == 50
    assert data["subscription"]["grade_key"] == GRADE
    assert data["subscription"]["active"] is True
    assert days_from_now(data["subscription"]["expires_at"]) == coins.SUBSCRIPTION_DAYS


def test_subscribe_without_enough_ksh_returns_402(student):
    credit_ksh(40)

    response = subscribe(student)

    assert response.status_code == 402
    assert response.get_json()["ksh_needed"] == 60
    assert account(student)["subscription"] is None


def test_subscribe_is_idempotent_per_request(student):
    credit_ksh(300)

    subscribe(student, "same-request")
    data = subscribe(student, "same-request").get_json()

    assert data["duplicate"] is True
    assert data["ksh"] == 200


def test_renewing_early_extends_from_current_end(student):
    credit_ksh(300)

    subscribe(student, "first-request")
    data = subscribe(student, "second-request").get_json()

    assert days_from_now(data["subscription"]["expires_at"]) == 2 * coins.SUBSCRIPTION_DAYS


def test_renewing_after_expiry_starts_from_now(student):
    credit_ksh(300)
    subscribe(student, "first-request")
    expire_subscriptions()

    data = subscribe(student, "second-request").get_json()

    assert days_from_now(data["subscription"]["expires_at"]) == coins.SUBSCRIPTION_DAYS


def test_subscribe_needs_a_grade(client):
    client.post("/api/account/import", json={"soma_hub_code": STUDENT_CODE, "coins": 0})
    conn = soma_app.get_db()
    conn.execute("UPDATE students SET grade = '' WHERE soma_hub_code = ?", (STUDENT_CODE,))
    conn.commit()
    conn.close()
    credit_ksh(100)

    assert subscribe(client).status_code == 400


# ------------------------------------------------------------
# Access
# ------------------------------------------------------------

def test_covered_material_opens_free_without_permanent_unlock(student):
    credit_ksh(100)
    subscribe(student)

    data = unlock(student).get_json()

    assert data["via_subscription"] is True
    assert data["coins_spent"] == 0 and data["ksh_spent"] == 0
    assert data["unlocked"] == []


def test_other_grade_is_not_covered(student):
    credit_ksh(100)
    subscribe(student)

    response = unlock(student, OTHER_GRADE)

    assert response.status_code == 402


def test_expired_subscription_no_longer_covers(student):
    credit_ksh(100)
    subscribe(student)
    expire_subscriptions()

    data = account(student)

    assert unlock(student).status_code == 402
    assert data["subscription"]["active"] is False


def test_coin_unlocks_survive_expiry(student):
    credit_ksh(100)
    conn = soma_app.get_db()
    conn.execute(
        "INSERT INTO coin_transactions (student_id, soma_hub_code, amount, transaction_type, "
        "reference, created_at) VALUES (1, ?, 5, 'TEST', 'T-1', '2026-01-01 00:00:00')",
        (STUDENT_CODE,),
    )
    conn.commit()
    conn.close()
    assert unlock(student, OTHER_GRADE).status_code == 200
    subscribe(student)
    expire_subscriptions()

    assert OTHER_GRADE in account(student)["unlocked"]


# ------------------------------------------------------------
# Paying with M-Pesa for a purpose
# ------------------------------------------------------------

def test_mpesa_payment_can_subscribe(student, stk_ok):
    status = pay_with_mpesa(student, 100, "subscribe")

    assert status["purpose"] == "subscribe"
    assert status["purpose_result"] == "done"
    data = account(student)
    assert data["subscription"]["active"] is True
    assert data["ksh"] == 0


def test_mpesa_shortfall_top_up_then_subscribe(student, stk_ok):
    credit_ksh(30)

    status = pay_with_mpesa(student, 70, "subscribe")

    assert status["purpose_result"] == "done"
    assert account(student)["ksh"] == 0


def test_mpesa_payment_can_unlock_a_material(student, stk_ok):
    status = pay_with_mpesa(student, 5, f"unlock:{OTHER_GRADE}")

    assert status["purpose_result"] == "done"
    data = account(student)
    assert OTHER_GRADE in data["unlocked"]
    assert data["ksh"] == 0


def test_failed_purpose_leaves_money_in_wallet(student, stk_ok):
    status = pay_with_mpesa(student, 40, "subscribe")

    assert status["purpose_result"].startswith("failed:")
    data = account(student)
    assert data["ksh"] == 40
    assert data["subscription"] is None


def test_purpose_runs_once(student, stk_ok):
    status = pay_with_mpesa(student, 100, "subscribe")
    session_id = status["session_id"]

    soma_app.coins_bp.fulfil_payment_purpose(session_id)
    student.get(f"/api/mpesa/payment-status/{session_id}")

    conn = soma_app.get_db()
    count = conn.execute("SELECT COUNT(*) FROM subscriptions").fetchone()[0]
    conn.close()
    assert count == 1


def test_real_callback_runs_the_purpose(student, stk_ok):
    student.post("/api/mpesa/payment-session", json={
        "soma_hub_code": STUDENT_CODE,
        "phone_number": PHONE,
        "amount": 100,
        "purpose": "subscribe",
    })

    student.post("/api/mpesa/callback", json={"Body": {"stkCallback": {
        "MerchantRequestID": "MR_1",
        "CheckoutRequestID": "ws_CO_1",
        "ResultCode": 0,
        "ResultDesc": "ok",
        "CallbackMetadata": {"Item": [
            {"Name": "Amount", "Value": 100},
            {"Name": "MpesaReceiptNumber", "Value": "QSUB00001"},
        ]},
    }}})

    assert account(student)["subscription"]["active"] is True


@pytest.mark.parametrize("purpose", ["delete-everything", "unlock:", "unlock:../x", 42])
def test_invalid_purpose_rejected(student, stk_ok, purpose):
    response = student.post("/api/mpesa/payment-session", json={
        "soma_hub_code": STUDENT_CODE,
        "phone_number": PHONE,
        "amount": 10,
        "purpose": purpose,
    })

    assert response.status_code == 400


# ------------------------------------------------------------
# Migration
# ------------------------------------------------------------

def test_init_adds_purpose_columns_to_old_payment_sessions(tmp_path, monkeypatch):
    db_path = tmp_path / "old.db"
    conn = sqlite3.connect(db_path)
    conn.execute(
        "CREATE TABLE payment_sessions (id INTEGER PRIMARY KEY, session_id TEXT, "
        "student_id INTEGER, soma_hub_code TEXT, amount INTEGER, status TEXT, "
        "checkout_request_id TEXT, merchant_request_id TEXT, created_at TEXT, "
        "expires_at TEXT, completed_at TEXT)"
    )
    conn.commit()
    conn.close()
    monkeypatch.setattr(database, "DATABASE_PATH", db_path)

    database.init_database()
    database.init_database()

    conn = sqlite3.connect(db_path)
    columns = {row[1] for row in conn.execute("PRAGMA table_info(payment_sessions)")}
    conn.close()
    assert {"purpose", "purpose_result"} <= columns

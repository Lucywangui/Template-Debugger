from unittest.mock import MagicMock

import pytest

import app as soma_app
from conftest import PHONE, STUDENT_CODE


@pytest.fixture
def stk_ok(monkeypatch):
    counter = {"n": 0}

    def fake_post(url, json=None, headers=None, timeout=None):
        counter["n"] += 1
        response = MagicMock()
        response.status_code = 200
        response.text = ""
        response.json.return_value = {
            "ResponseCode": "0",
            "CheckoutRequestID": f"ws_CO_{counter['n']}",
            "MerchantRequestID": f"MR_{counter['n']}",
        }
        return response

    monkeypatch.setattr(soma_app.requests, "post", fake_post)
    return counter


def start_session(client, amount=50):
    return client.post("/api/mpesa/payment-session", json={
        "soma_hub_code": STUDENT_CODE,
        "phone_number": PHONE,
        "amount": amount,
    })


def callback(client, checkout_id, result_code=0, amount=50, receipt="QKX123ABC"):
    stk = {
        "MerchantRequestID": "",
        "CheckoutRequestID": checkout_id,
        "ResultCode": result_code,
        "ResultDesc": "ok" if result_code == 0 else "Request cancelled by user",
    }
    if result_code == 0:
        stk["CallbackMetadata"] = {"Item": [
            {"Name": "Amount", "Value": amount},
            {"Name": "MpesaReceiptNumber", "Value": receipt},
            {"Name": "TransactionDate", "Value": 20260925120000},
            {"Name": "PhoneNumber", "Value": 254708374149},
        ]}
    return client.post("/api/mpesa/callback", json={"Body": {"stkCallback": stk}})


def status(client, session_id):
    return client.get(f"/api/mpesa/payment-status/{session_id}").get_json()


def balance(client):
    return client.get(f"/api/wallet/{STUDENT_CODE}").get_json()["balance"]


@pytest.mark.parametrize("amount", [10.5, "abc", 0, -5, 150001])
def test_rejects_invalid_amounts(client, stk_ok, amount):
    response = start_session(client, amount)

    assert response.status_code == 400
    assert stk_ok["n"] == 0


@pytest.mark.parametrize("amount", [1, "20", 50.0, 150000])
def test_accepts_whole_shilling_amounts(client, stk_ok, amount):
    response = start_session(client, amount)

    assert response.status_code == 200
    assert response.get_json()["amount"] == int(float(amount))


def test_successful_callback_credits_wallet(client, stk_ok):
    session_id = start_session(client, 50).get_json()["session_id"]

    callback(client, "ws_CO_1", amount=50)

    assert status(client, session_id)["status"] == "completed"
    assert balance(client) == 50


def test_cancelled_callback_marks_failed_without_credit(client, stk_ok):
    session_id = start_session(client, 50).get_json()["session_id"]

    callback(client, "ws_CO_1", result_code=1032)

    assert status(client, session_id)["status"] == "failed"
    assert balance(client) == 0


def test_duplicate_callback_credits_once(client, stk_ok):
    start_session(client, 50)

    callback(client, "ws_CO_1", amount=50, receipt="QKX999")
    callback(client, "ws_CO_1", amount=50, receipt="QKX999")

    assert balance(client) == 50


def test_pending_session_expires_after_deadline(client, stk_ok):
    session_id = start_session(client, 50).get_json()["session_id"]
    conn = soma_app.get_db()
    conn.execute(
        "UPDATE payment_sessions SET expires_at = ? WHERE session_id = ?",
        ("2000-01-01 00:00:00", session_id),
    )
    conn.commit()
    conn.close()

    assert status(client, session_id)["status"] == "expired"


def test_late_success_after_expiry_still_credits(client, stk_ok):
    session_id = start_session(client, 50).get_json()["session_id"]
    conn = soma_app.get_db()
    conn.execute(
        "UPDATE payment_sessions SET expires_at = ? WHERE session_id = ?",
        ("2000-01-01 00:00:00", session_id),
    )
    conn.commit()
    conn.close()
    status(client, session_id)

    callback(client, "ws_CO_1", amount=50)

    assert status(client, session_id)["status"] == "completed"
    assert balance(client) == 50


def test_unknown_student_returns_404(client, stk_ok):
    response = client.post("/api/mpesa/payment-session", json={
        "soma_hub_code": "SOMA-NOBODY",
        "phone_number": PHONE,
        "amount": 50,
    })

    assert response.status_code == 404


def test_register_keeps_client_code_and_is_idempotent(client):
    for grade in ("Grade 7", "Grade 8"):
        response = client.post("/api/students/register", json={
            "soma_hub_code": STUDENT_CODE,
            "name": "Test Student",
            "school_name": "Test School",
            "grade": grade,
        })
        assert response.get_json()["soma_hub_code"] == STUDENT_CODE

    conn = soma_app.get_db()
    rows = conn.execute(
        "SELECT grade FROM students WHERE soma_hub_code = ?",
        (STUDENT_CODE,),
    ).fetchall()
    conn.close()

    assert [row["grade"] for row in rows] == ["Grade 8"]


def test_dev_test_payment_credits_wallet(client, stk_ok, monkeypatch):
    monkeypatch.setattr(soma_app, "MPESA_ENVIRONMENT", "sandbox")
    session_id = start_session(client, 20).get_json()["session_id"]

    response = client.post(f"/api/dev/test-payment/{session_id}")

    assert response.status_code == 200
    assert status(client, session_id)["status"] == "completed"
    assert balance(client) == 20


def test_safaricom_rejection_message_is_passed_on(client, monkeypatch):
    def rejecting_post(url, json=None, headers=None, timeout=None):
        response = MagicMock()
        response.status_code = 500
        response.text = ""
        response.json.return_value = {
            "errorCode": "500.001.1001",
            "errorMessage": "Unable to lock subscriber, a transaction is already in process for the current subscriber",
        }
        return response

    monkeypatch.setattr(soma_app.requests, "post", rejecting_post)

    response = start_session(client, 50)

    assert response.status_code == 502
    assert "already in process" in response.get_json()["message"]

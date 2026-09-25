from datetime import date, timedelta

import pytest

import app as soma_app
import coins
from conftest import STUDENT_CODE, credit_ksh


def account(client):
    return client.get(f"/api/account/{STUDENT_CODE}").get_json()


def import_account(client, **body):
    return client.post("/api/account/import", json={"soma_hub_code": STUDENT_CODE, **body})


def unlock(client, material_id="math-g7-1", allow_ksh=False):
    return client.post("/api/unlocks", json={
        "soma_hub_code": STUDENT_CODE,
        "material_id": material_id,
        "allow_ksh": allow_ksh,
    })


def buy(client, coins_wanted, request_id="req-00000001"):
    return client.post("/api/coins/buy", json={
        "soma_hub_code": STUDENT_CODE,
        "coins": coins_wanted,
        "request_id": request_id,
    })


def reward(client, attempt_id="attempt-0001", quiz_type="topical", percentage=80):
    return client.post("/api/coins/reward", json={
        "soma_hub_code": STUDENT_CODE,
        "attempt_id": attempt_id,
        "material_id": "math-g7-1",
        "type": quiz_type,
        "percentage": percentage,
    })


def add_past_reward(days_ago, amount=15):
    day = (date.today() - timedelta(days=days_ago)).isoformat()
    conn = soma_app.get_db()
    conn.execute(
        "INSERT INTO coin_transactions (student_id, soma_hub_code, amount, "
        "transaction_type, reference, description, created_at) "
        "VALUES (1, ?, ?, 'REWARD', ?, 'past', ?)",
        (STUDENT_CODE, amount, f"PAST-{days_ago}", f"{day} 10:00:00"),
    )
    conn.commit()
    conn.close()


# ------------------------------------------------------------
# Account and import
# ------------------------------------------------------------

def test_new_account_is_empty_until_imported(client):
    data = account(client)

    assert data["coins"] == 0
    assert data["ksh"] == 0
    assert data["unlocked"] == []
    assert data["imported"] is False


def test_import_moves_local_coins_and_unlocks(client):
    data = import_account(client, coins=80, unlocked=["math-g7-1", "eng-g7-2"]).get_json()

    assert data["coins"] == 80
    assert data["unlocked"] == ["math-g7-1", "eng-g7-2"]
    assert data["imported"] is True


def test_import_caps_coins(client):
    assert import_account(client, coins=99999).get_json()["coins"] == coins.IMPORT_COIN_CAP


def test_import_without_local_coins_gives_starter_coins(client):
    assert import_account(client).get_json()["coins"] == 100


def test_import_runs_only_once(client):
    import_account(client, coins=80, unlocked=["math-g7-1"])

    data = import_account(client, coins=400, unlocked=["other"]).get_json()

    assert data["coins"] == 80
    assert data["unlocked"] == ["math-g7-1"]


def test_import_ignores_invalid_material_ids(client):
    data = import_account(client, coins=10, unlocked=["ok-id", "<script>", ""]).get_json()

    assert data["unlocked"] == ["ok-id"]


def test_unknown_student_is_404(client):
    response = client.post("/api/unlocks", json={"soma_hub_code": "NOBODY", "material_id": "x"})

    assert response.status_code == 404


# ------------------------------------------------------------
# Unlocks
# ------------------------------------------------------------

def test_unlock_with_coins(client):
    import_account(client, coins=12)

    data = unlock(client).get_json()

    assert data["coins_spent"] == 5
    assert data["ksh_spent"] == 0
    assert data["coins"] == 7
    assert "math-g7-1" in data["unlocked"]


def test_repeat_unlock_is_free(client):
    import_account(client, coins=12)
    unlock(client)

    data = unlock(client).get_json()

    assert data["already_unlocked"] is True
    assert data["coins"] == 7


def test_short_on_coins_without_ksh_permission_returns_402(client):
    import_account(client, coins=2)
    credit_ksh(50)

    response = unlock(client)
    data = response.get_json()

    assert response.status_code == 402
    assert data["shortfall_coins"] == 3
    assert data["ksh_needed"] == 3
    assert data["can_pay_with_ksh"] is True
    assert account(client)["coins"] == 2


def test_shortfall_paid_from_ksh(client):
    import_account(client, coins=2)
    credit_ksh(50)

    data = unlock(client, allow_ksh=True).get_json()

    assert data["coins_spent"] == 2
    assert data["ksh_spent"] == 3
    assert data["coins"] == 0
    assert data["ksh"] == 47


def test_unlock_fails_when_neither_balance_covers_it(client):
    import_account(client, coins=1)
    credit_ksh(2)

    response = unlock(client, allow_ksh=True)

    assert response.status_code == 402
    assert response.get_json()["can_pay_with_ksh"] is False
    assert account(client)["unlocked"] == []


def test_unlock_rejects_bad_material_id(client):
    import_account(client, coins=50)

    assert unlock(client, material_id="../etc").status_code == 400


# ------------------------------------------------------------
# Buying coins
# ------------------------------------------------------------

def test_buy_coins_with_ksh(client):
    import_account(client, coins=0)
    credit_ksh(100)

    data = buy(client, 50).get_json()

    assert data["coins"] == 50
    assert data["ksh"] == 50


def test_buy_is_idempotent_per_request_id(client):
    import_account(client, coins=0)
    credit_ksh(100)

    buy(client, 50)
    data = buy(client, 50).get_json()

    assert data["duplicate"] is True
    assert data["coins"] == 50
    assert data["ksh"] == 50


def test_buy_without_enough_ksh_returns_402(client):
    import_account(client, coins=0)
    credit_ksh(10)

    response = buy(client, 50)

    assert response.status_code == 402
    assert account(client)["ksh"] == 10


@pytest.mark.parametrize("amount", [0, -5, 2.5, "10", True, 10001])
def test_buy_rejects_invalid_amounts(client, amount):
    credit_ksh(100)

    assert buy(client, amount).status_code == 400


# ------------------------------------------------------------
# Rewards
# ------------------------------------------------------------

@pytest.mark.parametrize("quiz_type,percentage,expected", [
    ("topical", 80, 15),
    ("exam", 80, 25),
    ("topical", 100, 25),
    ("exam", 100, 35),
])
def test_reward_amounts(client, quiz_type, percentage, expected):
    data = reward(client, quiz_type=quiz_type, percentage=percentage).get_json()

    assert data["coins_awarded"] == expected
    assert data["coins"] == expected


def test_repeat_attempt_pays_once(client):
    reward(client, attempt_id="attempt-same")

    data = reward(client, attempt_id="attempt-same").get_json()

    assert data["duplicate"] is True
    assert data["coins"] == 15


def test_daily_cap(client):
    awarded = [
        reward(client, attempt_id=f"attempt-{i:04d}", quiz_type="exam", percentage=100)
        .get_json()["coins_awarded"]
        for i in range(7)
    ]

    assert sum(awarded) == coins.DAILY_COIN_CAP
    assert awarded[-1] == 0
    assert account(client)["earned_today"] == coins.DAILY_COIN_CAP


def test_past_days_do_not_count_toward_todays_cap(client):
    add_past_reward(days_ago=1, amount=200)

    assert reward(client).get_json()["coins_awarded"] == 15


def test_seven_day_streak_bonus_on_first_reward_of_the_day(client):
    for days_ago in range(1, 7):
        add_past_reward(days_ago)

    first = reward(client, attempt_id="attempt-a").get_json()
    second = reward(client, attempt_id="attempt-b").get_json()

    assert first["streak_bonus"] is True
    assert first["coins_awarded"] == 15 + 40
    assert second["streak_bonus"] is False


def test_broken_streak_gets_no_bonus(client):
    for days_ago in [1, 2, 3, 5, 6, 7]:
        add_past_reward(days_ago)

    assert reward(client).get_json()["streak_bonus"] is False


@pytest.mark.parametrize("body", [
    {"attempt_id": ""},
    {"type": "homework"},
    {"percentage": 101},
    {"percentage": "90"},
])
def test_reward_rejects_invalid_claims(client, body):
    payload = {
        "soma_hub_code": STUDENT_CODE,
        "attempt_id": "attempt-0001",
        "material_id": "math-g7-1",
        "type": "topical",
        "percentage": 80,
        **body,
    }

    assert client.post("/api/coins/reward", json=payload).status_code == 400


# ------------------------------------------------------------
# Development coins
# ------------------------------------------------------------

def test_dev_grant_only_in_sandbox(client, monkeypatch):
    monkeypatch.setattr(soma_app, "MPESA_ENVIRONMENT", "production")
    body = {"soma_hub_code": STUDENT_CODE}

    assert client.post("/api/dev/grant-coins", json=body).status_code == 403

    monkeypatch.setattr(soma_app, "MPESA_ENVIRONMENT", "sandbox")
    assert client.post("/api/dev/grant-coins", json=body).get_json()["coins"] == 100

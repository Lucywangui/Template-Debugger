import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app as soma_app  # noqa: E402
import database  # noqa: E402

STUDENT_CODE = "SOMA-TEST-001"
PHONE = "0708374149"


@pytest.fixture
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setattr(database, "DATABASE_PATH", db_path)
    monkeypatch.setattr(soma_app, "DB_PATH", str(db_path))
    database.init_database()

    monkeypatch.setattr(soma_app, "get_mpesa_access_token", lambda: "token")

    client = soma_app.app.test_client()
    response = client.post("/api/students/register", json={
        "soma_hub_code": STUDENT_CODE,
        "name": "Test Student",
        "school_name": "Test School",
        "grade": "Grade 7",
    })
    assert response.status_code in (200, 201), response.get_json()
    return client


def credit_ksh(amount, soma_hub_code=STUDENT_CODE):
    """Puts KSh in the wallet the way a completed M-Pesa top-up does."""
    conn = soma_app.get_db()
    student = conn.execute(
        "SELECT id FROM students WHERE soma_hub_code = ?", (soma_hub_code,)
    ).fetchone()
    conn.execute(
        "INSERT INTO wallet_transactions (student_id, soma_hub_code, amount, "
        "transaction_type, reference, description, created_at) "
        "VALUES (?, ?, ?, 'CREDIT', ?, 'test top-up', '2026-01-01 00:00:00')",
        (student["id"], soma_hub_code, amount, f"TEST-{amount}"),
    )
    conn.commit()
    conn.close()

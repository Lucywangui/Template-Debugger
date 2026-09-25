"""
SOMA Coins and material unlocks.

The server owns both balances:
    coins -> coin_transactions ledger (this module)
    KSh   -> wallet_transactions ledger (M-Pesa top-ups in app.py)

Quiz answers are graded in the app, so the server cannot verify a
reward claim. It limits abuse instead: each attempt pays once and
earnings are capped per day.
"""

import os
import re
import uuid
from datetime import date, timedelta

from flask import Blueprint, jsonify, request


MATERIAL_PRICE_COINS = int(os.getenv("MATERIAL_PRICE_COINS", "5"))
KSH_PER_COIN = int(os.getenv("KSH_PER_COIN", "1"))
DAILY_COIN_CAP = int(os.getenv("DAILY_COIN_CAP", "200"))
IMPORT_COIN_CAP = int(os.getenv("IMPORT_COIN_CAP", "500"))
DEFAULT_STARTING_COINS = 100
MAX_COINS_PER_PURCHASE = 10000
MAX_IMPORTED_UNLOCKS = 1000

REWARD_BASE = {"topical": 15, "exam": 25}
PERFECT_BONUS = 10
STREAK_MILESTONE_BONUS = 40
STREAK_MILESTONE_DAYS = 7

ID_PATTERN = re.compile(r"[A-Za-z0-9_:.\-]{1,120}")


def error(message, status, **extra):
    return jsonify({"success": False, "message": message, **extra}), status


def create_coins_blueprint(get_db, now_string, calculate_wallet_balance, is_sandbox):
    bp = Blueprint("coins", __name__)

    # --------------------------------------------------------
    # Helpers
    # --------------------------------------------------------

    def find_student(conn, soma_hub_code):
        return conn.execute(
            "SELECT id, soma_hub_code FROM students WHERE soma_hub_code = ?",
            (soma_hub_code,),
        ).fetchone()

    def coin_balance(conn, soma_hub_code):
        row = conn.execute(
            "SELECT COALESCE(SUM(amount), 0) AS balance "
            "FROM coin_transactions WHERE soma_hub_code = ?",
            (soma_hub_code,),
        ).fetchone()
        return int(row["balance"])

    def ksh_balance(conn, soma_hub_code):
        return int(round(calculate_wallet_balance(conn, soma_hub_code)))

    def earned_today(conn, soma_hub_code):
        row = conn.execute(
            "SELECT COALESCE(SUM(amount), 0) AS earned "
            "FROM coin_transactions "
            "WHERE soma_hub_code = ? AND transaction_type = 'REWARD' "
            "AND substr(created_at, 1, 10) = ?",
            (soma_hub_code, date.today().isoformat()),
        ).fetchone()
        return int(row["earned"])

    def account_payload(conn, soma_hub_code):
        unlocked = conn.execute(
            "SELECT material_id FROM material_unlocks "
            "WHERE soma_hub_code = ? ORDER BY id",
            (soma_hub_code,),
        ).fetchall()
        imported = conn.execute(
            "SELECT 1 FROM coin_transactions "
            "WHERE soma_hub_code = ? AND transaction_type = 'IMPORT' LIMIT 1",
            (soma_hub_code,),
        ).fetchone()

        return {
            "coins": coin_balance(conn, soma_hub_code),
            "ksh": ksh_balance(conn, soma_hub_code),
            "unlocked": [row["material_id"] for row in unlocked],
            "earned_today": earned_today(conn, soma_hub_code),
            "imported": bool(imported),
            "prices": {
                "material_coins": MATERIAL_PRICE_COINS,
                "ksh_per_coin": KSH_PER_COIN,
                "daily_cap": DAILY_COIN_CAP,
            },
        }

    def add_coins(conn, student, amount, transaction_type, reference, description):
        conn.execute(
            "INSERT INTO coin_transactions (student_id, soma_hub_code, amount, "
            "transaction_type, reference, description, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                student["id"],
                student["soma_hub_code"],
                amount,
                transaction_type,
                reference,
                description,
                now_string(),
            ),
        )

    def debit_ksh(conn, student, amount, reference, description):
        conn.execute(
            "INSERT INTO wallet_transactions (student_id, soma_hub_code, amount, "
            "transaction_type, reference, description, created_at) "
            "VALUES (?, ?, ?, 'DEBIT', ?, ?, ?)",
            (
                student["id"],
                student["soma_hub_code"],
                amount,
                reference,
                description,
                now_string(),
            ),
        )

    def reference_exists(conn, reference):
        return conn.execute(
            "SELECT 1 FROM coin_transactions WHERE reference = ? LIMIT 1",
            (reference,),
        ).fetchone() is not None

    def reward_streak_after_today(conn, soma_hub_code):
        """Consecutive days with a reward, ending today (today counts)."""
        rows = conn.execute(
            "SELECT DISTINCT substr(created_at, 1, 10) AS day "
            "FROM coin_transactions "
            "WHERE soma_hub_code = ? AND transaction_type = 'REWARD'",
            (soma_hub_code,),
        ).fetchall()
        days = {row["day"] for row in rows}
        days.add(date.today().isoformat())

        streak = 0
        day = date.today()
        while day.isoformat() in days:
            streak += 1
            day -= timedelta(days=1)
        return streak

    def read_body():
        data = request.get_json(silent=True) or {}
        code = str(data.get("soma_hub_code", "")).strip().upper()
        return data, code

    def with_student(handler):
        """Opens a connection, loads the student, and always closes it."""

        def wrapper(*args, **kwargs):
            data, code = read_body()
            if not code:
                return error("SOMA HUB code is required", 400)

            conn = get_db()
            try:
                student = find_student(conn, code)
                if not student:
                    return error("Student not found", 404)
                return handler(conn, student, data, *args, **kwargs)
            except Exception:
                conn.rollback()
                raise
            finally:
                conn.close()

        wrapper.__name__ = handler.__name__
        return wrapper

    # --------------------------------------------------------
    # Account
    # --------------------------------------------------------

    @bp.route("/api/account/<soma_hub_code>", methods=["GET"])
    def get_account(soma_hub_code):
        conn = get_db()
        try:
            code = soma_hub_code.strip().upper()
            if not find_student(conn, code):
                return error("Student not found", 404)
            return jsonify({"success": True, **account_payload(conn, code)})
        finally:
            conn.close()

    @bp.route("/api/account/import", methods=["POST"])
    @with_student
    def import_account(conn, student, data):
        """One-time move of a device's local coins and unlocks to the server."""
        code = student["soma_hub_code"]
        reference = f"IMPORT-{code}"

        conn.execute("BEGIN IMMEDIATE")

        if not reference_exists(conn, reference):
            try:
                local_coins = int(data.get("coins", DEFAULT_STARTING_COINS))
            except (TypeError, ValueError):
                local_coins = DEFAULT_STARTING_COINS
            coins = max(0, min(local_coins, IMPORT_COIN_CAP))

            add_coins(conn, student, coins, "IMPORT", reference, "Coins moved from this device")

            unlocked = data.get("unlocked") or []
            if not isinstance(unlocked, list):
                unlocked = []
            for material_id in unlocked[:MAX_IMPORTED_UNLOCKS]:
                material_id = str(material_id)
                if ID_PATTERN.fullmatch(material_id):
                    conn.execute(
                        "INSERT OR IGNORE INTO material_unlocks (student_id, "
                        "soma_hub_code, material_id, created_at) VALUES (?, ?, ?, ?)",
                        (student["id"], code, material_id, now_string()),
                    )

        conn.commit()
        return jsonify({"success": True, **account_payload(conn, code)})

    # --------------------------------------------------------
    # Unlock a material
    # --------------------------------------------------------

    @bp.route("/api/unlocks", methods=["POST"])
    @with_student
    def unlock_material(conn, student, data):
        code = student["soma_hub_code"]
        material_id = str(data.get("material_id", "")).strip()
        allow_ksh = data.get("allow_ksh") is True

        if not ID_PATTERN.fullmatch(material_id):
            return error("A valid material ID is required", 400)

        conn.execute("BEGIN IMMEDIATE")

        already = conn.execute(
            "SELECT 1 FROM material_unlocks WHERE student_id = ? AND material_id = ?",
            (student["id"], material_id),
        ).fetchone()
        if already:
            conn.commit()
            return jsonify({
                "success": True,
                "already_unlocked": True,
                "coins_spent": 0,
                "ksh_spent": 0,
                **account_payload(conn, code),
            })

        price = MATERIAL_PRICE_COINS
        coins = coin_balance(conn, code)
        ksh = ksh_balance(conn, code)

        if coins >= price:
            coins_spent, ksh_spent = price, 0
        else:
            shortfall = price - coins
            ksh_needed = shortfall * KSH_PER_COIN
            if not allow_ksh or ksh < ksh_needed:
                conn.rollback()
                return error(
                    "Not enough coins",
                    402,
                    coins=coins,
                    ksh=ksh,
                    price=price,
                    shortfall_coins=shortfall,
                    ksh_needed=ksh_needed,
                    can_pay_with_ksh=ksh >= ksh_needed,
                )
            coins_spent, ksh_spent = coins, ksh_needed

        reference = f"UNLOCK-{code}-{material_id}"

        if ksh_spent:
            debit_ksh(conn, student, ksh_spent, reference, f"Unlocked {material_id}")
        if coins_spent:
            add_coins(conn, student, -coins_spent, "UNLOCK", reference, f"Unlocked {material_id}")

        conn.execute(
            "INSERT INTO material_unlocks (student_id, soma_hub_code, material_id, "
            "coins_spent, ksh_spent, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (student["id"], code, material_id, coins_spent, ksh_spent, now_string()),
        )
        conn.commit()

        return jsonify({
            "success": True,
            "already_unlocked": False,
            "coins_spent": coins_spent,
            "ksh_spent": ksh_spent,
            **account_payload(conn, code),
        })

    # --------------------------------------------------------
    # Buy coins with KSh
    # --------------------------------------------------------

    @bp.route("/api/coins/buy", methods=["POST"])
    @with_student
    def buy_coins(conn, student, data):
        code = student["soma_hub_code"]
        request_id = str(data.get("request_id", "")).strip()

        if not ID_PATTERN.fullmatch(request_id):
            return error("A request ID is required", 400)

        coins = data.get("coins")
        if not isinstance(coins, int) or isinstance(coins, bool) or not (
            1 <= coins <= MAX_COINS_PER_PURCHASE
        ):
            return error(
                f"Coins must be a whole number from 1 to {MAX_COINS_PER_PURCHASE}", 400
            )

        reference = f"BUY-{request_id}"

        conn.execute("BEGIN IMMEDIATE")

        if reference_exists(conn, reference):
            conn.commit()
            return jsonify({"success": True, "duplicate": True, **account_payload(conn, code)})

        ksh_cost = coins * KSH_PER_COIN
        ksh = ksh_balance(conn, code)
        if ksh < ksh_cost:
            conn.rollback()
            return error("Not enough KSh in your wallet", 402, ksh=ksh, ksh_needed=ksh_cost)

        debit_ksh(conn, student, ksh_cost, reference, f"Bought {coins} coins")
        add_coins(conn, student, coins, "PURCHASE", reference, f"Bought {coins} coins")
        conn.commit()

        return jsonify({
            "success": True,
            "duplicate": False,
            "ksh_spent": ksh_cost,
            **account_payload(conn, code),
        })

    # --------------------------------------------------------
    # Quiz rewards
    # --------------------------------------------------------

    @bp.route("/api/coins/reward", methods=["POST"])
    @with_student
    def claim_reward(conn, student, data):
        code = student["soma_hub_code"]
        attempt_id = str(data.get("attempt_id", "")).strip()
        material_id = str(data.get("material_id", "")).strip()
        quiz_type = data.get("type")
        percentage = data.get("percentage")

        if not ID_PATTERN.fullmatch(attempt_id):
            return error("An attempt ID is required", 400)
        if not ID_PATTERN.fullmatch(material_id):
            return error("A valid material ID is required", 400)
        if quiz_type not in REWARD_BASE:
            return error("Type must be 'topical' or 'exam'", 400)
        if (
            not isinstance(percentage, (int, float))
            or isinstance(percentage, bool)
            or not 0 <= percentage <= 100
        ):
            return error("Percentage must be between 0 and 100", 400)

        reference = f"REWARD-{code}-{attempt_id}"

        conn.execute("BEGIN IMMEDIATE")

        if reference_exists(conn, reference):
            conn.commit()
            return jsonify({
                "success": True,
                "duplicate": True,
                "coins_awarded": 0,
                **account_payload(conn, code),
            })

        first_reward_today = not conn.execute(
            "SELECT 1 FROM coin_transactions WHERE soma_hub_code = ? "
            "AND transaction_type = 'REWARD' AND substr(created_at, 1, 10) = ? LIMIT 1",
            (code, date.today().isoformat()),
        ).fetchone()

        reward = REWARD_BASE[quiz_type]
        if percentage >= 100:
            reward += PERFECT_BONUS

        streak = reward_streak_after_today(conn, code)
        milestone = first_reward_today and streak % STREAK_MILESTONE_DAYS == 0
        if milestone:
            reward += STREAK_MILESTONE_BONUS

        remaining = max(0, DAILY_COIN_CAP - earned_today(conn, code))
        awarded = min(reward, remaining)

        description = (
            f"Quiz reward + {streak}-day streak" if milestone else "Quiz reward"
        )
        add_coins(conn, student, awarded, "REWARD", reference, description)
        conn.commit()

        return jsonify({
            "success": True,
            "duplicate": False,
            "coins_awarded": awarded,
            "capped": awarded < reward,
            "streak_bonus": milestone,
            **account_payload(conn, code),
        })

    # --------------------------------------------------------
    # Development coins
    # --------------------------------------------------------

    @bp.route("/api/dev/grant-coins", methods=["POST"])
    @with_student
    def dev_grant_coins(conn, student, data):
        if not is_sandbox():
            return error("Development coins are disabled in production", 403)

        add_coins(
            conn,
            student,
            100,
            "DEV_GRANT",
            f"DEV-{uuid.uuid4().hex}",
            "Development test coins",
        )
        conn.commit()
        return jsonify({"success": True, **account_payload(conn, student["soma_hub_code"])})

    return bp

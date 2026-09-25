import sqlite3
from pathlib import Path


# Database file will be created in this backend folder
DATABASE_PATH = Path(__file__).parent / "soma_hub.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_database():
    connection = get_connection()

    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            soma_hub_code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            school_name TEXT,
            grade TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS term_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            term_key TEXT NOT NULL,
            study_notes_points INTEGER NOT NULL DEFAULT 0,
            topical_quiz_points INTEGER NOT NULL DEFAULT 0,
            exam_points INTEGER NOT NULL DEFAULT 0,
            consistency_points INTEGER NOT NULL DEFAULT 0,
            improvement_points INTEGER NOT NULL DEFAULT 0,
            total_points INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            UNIQUE(student_id, term_key)
        );

        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            material_id TEXT,
            material_title TEXT,
            subject TEXT,
            grade_key TEXT,
            quiz_type TEXT NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            percentage REAL NOT NULL,
            completed_at TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        );

        /*
        ============================================================
        PAYMENT SESSIONS
        ============================================================

        A payment session connects an amount the student wants to
        pay with the student's existing SOMA HUB code.

        Example:

            soma_hub_code = the student's existing code
            amount = 50
            status = PENDING

        This is NOT the M-Pesa transaction itself.

        It is the temporary bridge between SOMA HUB and M-Pesa.
        ============================================================
        */
        CREATE TABLE IF NOT EXISTS payment_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            session_id TEXT NOT NULL UNIQUE,

            student_id INTEGER NOT NULL,

            soma_hub_code TEXT NOT NULL,

            amount INTEGER NOT NULL,

            status TEXT NOT NULL DEFAULT 'PENDING',

            checkout_request_id TEXT,

            merchant_request_id TEXT,

            created_at TEXT NOT NULL,

            expires_at TEXT NOT NULL,

            completed_at TEXT,

            FOREIGN KEY (student_id)
                REFERENCES students(id)
                ON DELETE CASCADE
        );


        /*
        ============================================================
        M-PESA TRANSACTIONS
        ============================================================

        Every confirmed M-Pesa payment is permanently recorded here.

        The M-Pesa transaction ID is UNIQUE.

        This prevents the same Safaricom callback from crediting
        the student's wallet more than once.
        ============================================================
        */
        CREATE TABLE IF NOT EXISTS mpesa_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            transaction_id TEXT NOT NULL UNIQUE,

            payment_session_id TEXT,

            student_id INTEGER NOT NULL,

            soma_hub_code TEXT NOT NULL,

            amount INTEGER NOT NULL,

            transaction_type TEXT,

            transaction_time TEXT,

            mpesa_phone TEXT,

            first_name TEXT,

            middle_name TEXT,

            last_name TEXT,

            status TEXT NOT NULL DEFAULT 'COMPLETED',

            created_at TEXT NOT NULL,

            FOREIGN KEY (student_id)
                REFERENCES students(id)
                ON DELETE CASCADE,

            FOREIGN KEY (payment_session_id)
                REFERENCES payment_sessions(session_id)
                ON DELETE SET NULL
        );


        /*
        ============================================================
        WALLET TRANSACTIONS
        ============================================================

        This is the accounting ledger for the student's wallet.

        Positive amounts = money added.

        Negative amounts can later be used when SOMA HUB deducts
        money for purchases.

        The wallet balance itself will eventually be calculated/
        maintained from these records rather than trusting the
        frontend's localStorage value.
        ============================================================
        */
        CREATE TABLE IF NOT EXISTS wallet_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            student_id INTEGER NOT NULL,

            soma_hub_code TEXT NOT NULL,

            amount INTEGER NOT NULL,

            transaction_type TEXT NOT NULL,

            reference TEXT,

            description TEXT,

            created_at TEXT NOT NULL,

            FOREIGN KEY (student_id)
                REFERENCES students(id)
                ON DELETE CASCADE
        );


        /*
        ============================================================
        INDEXES
        ============================================================
        */

        CREATE INDEX IF NOT EXISTS idx_students_soma_hub_code
        ON students(soma_hub_code);

        CREATE INDEX IF NOT EXISTS idx_term_points_student
        ON term_points(student_id);

        CREATE INDEX IF NOT EXISTS idx_quiz_results_student
        ON quiz_results(student_id);

        CREATE INDEX IF NOT EXISTS idx_payment_sessions_student
        ON payment_sessions(student_id);

        CREATE INDEX IF NOT EXISTS idx_payment_sessions_soma_code
        ON payment_sessions(soma_hub_code);

        CREATE INDEX IF NOT EXISTS idx_payment_sessions_status
        ON payment_sessions(status);

        CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_student
        ON mpesa_transactions(student_id);

        CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_soma_code
        ON mpesa_transactions(soma_hub_code);

        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_student
        ON wallet_transactions(student_id);

        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_soma_code
        ON wallet_transactions(soma_hub_code);
        """
    )

    connection.commit()
    connection.close()


if __name__ == "__main__":
    init_database()
    print("SOMA HUB database created successfully:")
    print(DATABASE_PATH)
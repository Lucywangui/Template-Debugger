import sqlite3
from werkzeug.security import generate_password_hash
from datetime import datetime


DATABASE = "soma_hub.db"


username = input("Enter developer username: ").strip()
password = input("Enter developer password: ").strip()

if not username or not password:
    print("Username and password are required.")
    raise SystemExit


connection = sqlite3.connect(DATABASE)

try:
    password_hash = generate_password_hash(password)

    connection.execute(
        """
        INSERT INTO admins (username, password_hash, created_at)
        VALUES (?, ?, ?)
        """,
        (username, password_hash, datetime.now().isoformat())
    )

    connection.commit()

    print("Developer account created successfully.")

except sqlite3.IntegrityError:
    print("That username already exists.")

finally:
    connection.close()
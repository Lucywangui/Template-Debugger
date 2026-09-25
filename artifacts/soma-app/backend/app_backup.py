from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import base64
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")

@app.route("/")
def home():
    return {"message": "SOMA backend is running"}

@app.route("/api/test")
def test():
    return {"success": True, "message": "Frontend can connect to Flask"}

@app.route("/api/mpesa-config-test")
def mpesa_config_test():
    return {
        "consumer_key_loaded": bool(MPESA_CONSUMER_KEY),
        "consumer_secret_loaded": bool(MPESA_CONSUMER_SECRET)
    }

@app.route("/api/mpesa/token")
def mpesa_token():
    credentials = f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}"
    encoded_credentials = base64.b64encode(
        credentials.encode()
    ).decode()

    response = requests.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        headers={
            "Authorization": f"Basic {encoded_credentials}"
        }
    )

    return response.json(), response.status_code

@app.route("/api/mpesa/stk-push", methods=["POST"])
def stk_push():
    data = request.get_json() or {}

    phone = data.get("phone")
    amount = data.get("amount")

    if not phone or not amount:
        return {
            "success": False,
            "message": "Phone number and amount are required"
        }, 400

    credentials = f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}"
    encoded_credentials = base64.b64encode(
        credentials.encode()
    ).decode()

    token_response = requests.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        headers={
            "Authorization": f"Basic {encoded_credentials}"
        }
    )

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return {
            "success": False,
            "message": "Could not get M-PESA access token",
            "details": token_data
        }, 500

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    business_shortcode = os.getenv("MPESA_SHORTCODE", "174379")
    passkey = os.getenv("MPESA_PASSKEY")

    if not passkey:
        return {
            "success": False,
            "message": "MPESA_PASSKEY is not configured yet"
        }, 500

    password = base64.b64encode(
        f"{business_shortcode}{passkey}{timestamp}".encode()
    ).decode()

    payload = {
        "BusinessShortCode": business_shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone,
        "PartyB": business_shortcode,
        "PhoneNumber": phone,
        "CallBackURL": os.getenv(
            "MPESA_CALLBACK_URL",
            "https://example.com/api/mpesa/callback"
        ),
        "AccountReference": "SOMA",
        "TransactionDesc": "SOMA material"
    }

    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    )

    return response.json(), response.status_code

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

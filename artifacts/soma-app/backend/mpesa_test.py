import base64
import requests
from datetime import datetime


# ============================================================
# SOMA HUB - DARAJA M-PESA EXPRESS SANDBOX TEST
# ============================================================

# PUT YOUR DARAJA DETAILS HERE
CONSUMER_KEY = "KNsQCFashR07jWfHmxNB0f5vGTKstGAMK0itXTIl3xKo6h1C"
CONSUMER_SECRET = "zbLHashjbXWdm8lGGEGOvnc9oWmR02VoG3dtdl9TbRCAgmvq4IvFQuDDAJoRIVed"

# Sandbox passkey from the Daraja simulator
PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"


# ============================================================
# SANDBOX DETAILS
# ============================================================

BUSINESS_SHORTCODE = "174379"
PARTY_B = "174379"

TRANSACTION_TYPE = "CustomerPayBillOnline"


# ============================================================
# CUSTOMER PHONE
# ============================================================

PHONE_NUMBER = "254703194339"

PARTY_A = PHONE_NUMBER


# ============================================================
# PAYMENT
# ============================================================

AMOUNT = 1

ACCOUNT_REFERENCE = "SOMATEST"

TRANSACTION_DESCRIPTION = "SOMA TEST"


# ============================================================
# CALLBACK
# ============================================================

CALLBACK_URL = "https://example.com/mpesa/callback"


# ============================================================
# SAFARICOM SANDBOX URLs
# ============================================================

OAUTH_URL = (
    "https://sandbox.safaricom.co.ke/"
    "oauth/v1/generate?grant_type=client_credentials"
)

STK_PUSH_URL = (
    "https://sandbox.safaricom.co.ke/"
    "mpesa/stkpush/v1/processrequest"
)


# ============================================================
# GET ACCESS TOKEN
# ============================================================

def get_access_token():

    print("\nGetting access token...")

    response = requests.get(
        OAUTH_URL,
        auth=(CONSUMER_KEY, CONSUMER_SECRET),
        timeout=30
    )

    print("\nHTTP Status:", response.status_code)
    print("Response:", response.text)

    if response.status_code != 200:
        print("\nFailed to get access token.")
        return None

    data = response.json()

    return data.get("access_token")


# ============================================================
# CREATE PASSWORD
# ============================================================

def create_password():

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    password_string = (
        BUSINESS_SHORTCODE
        + PASSKEY
        + timestamp
    )

    password = base64.b64encode(
        password_string.encode()
    ).decode()

    return password, timestamp


# ============================================================
# SEND STK PUSH
# ============================================================

def send_stk_push(access_token):

    password, timestamp = create_password()

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {

        "BusinessShortCode": int(BUSINESS_SHORTCODE),

        "Password": password,

        "Timestamp": timestamp,

        "TransactionType": TRANSACTION_TYPE,

        "Amount": AMOUNT,

        "PartyA": PARTY_A,

        "PartyB": int(PARTY_B),

        "PhoneNumber": PHONE_NUMBER,

        "CallBackURL": CALLBACK_URL,

        "AccountReference": ACCOUNT_REFERENCE,

        "TransactionDesc": TRANSACTION_DESCRIPTION
    }

    print("\nSending STK Push...")

    print("\nRequest:")
    print(payload)

    response = requests.post(
        STK_PUSH_URL,
        json=payload,
        headers=headers,
        timeout=30
    )

    print("\n========================================")
    print("SAFARICOM RESPONSE")
    print("========================================")

    print("HTTP Status:", response.status_code)
    print("Response:", response.text)

    return response


# ============================================================
# MAIN
# ============================================================

print("\n========================================")
print("SOMA HUB M-PESA EXPRESS TEST")
print("========================================")


access_token = get_access_token()


if access_token:

    print("\nAccess token received.")

    send_stk_push(access_token)

else:

    print("\nCould not get access token.")
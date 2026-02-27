# agents/tools/tools.py

import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://hackfusion-final.onrender.com"
TIMEOUT = 5


def safe_request(method, endpoint, **kwargs):
    try:
        url = f"{BASE_URL}{endpoint}"
        response = requests.request(method, url, timeout=TIMEOUT, **kwargs)

        try:
            data = response.json()
        except Exception:
            return {"status": "error", "code": "invalid_response"}

        return data

    except requests.exceptions.Timeout:
        return {"status": "error", "code": "backend_timeout"}

    except requests.exceptions.ConnectionError:
        return {"status": "error", "code": "backend_unreachable"}

    except Exception:
        return {"status": "error", "code": "unexpected_error"}


# -----------------------------------
# Health
# -----------------------------------
def health_check():
    return safe_request("GET", "/health")


# -----------------------------------
# Inventory
# -----------------------------------
def check_inventory(medicine_name):
    return safe_request("GET", f"/inventory/{medicine_name}")


# -----------------------------------
# Create Order
# -----------------------------------
# agents/tools/tools.py - Update only the create_order function
def create_order(customer_id, medicine_name, quantity):
    return safe_request(
        "POST",
        "/create-order",
        json={
            "customer_id": customer_id,
            "medicine": medicine_name,  # The backend expects 'medicine'
            "quantity": quantity
        }
    )



# -----------------------------------
# Verify Prescription
# -----------------------------------
def verify_prescription(customer_id, medicine_id):
    return safe_request(
        "POST",
        "/verify-prescription",
        json={
            "customer_id": customer_id,
            "medicine_id": medicine_id
        }
    )


# -----------------------------------
# Prescription Status
# -----------------------------------
def check_prescription_status(customer_id, medicine_id):
    return safe_request(
        "GET",
        f"/prescription-status/{customer_id}/{medicine_id}"
    )


# -----------------------------------
# Customer History
# -----------------------------------
def get_customer_history(customer_id):
    return safe_request(
        "GET",
        f"/customer-history/{customer_id}"
    )
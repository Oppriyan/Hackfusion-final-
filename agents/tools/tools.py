import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://hackfusion-final.onrender.com"

def safe_request(method, endpoint, **kwargs):
    try:
        url = f"{BASE_URL}{endpoint}"
        response = requests.request(method, url, **kwargs)

        if not response.text:
            return {"status": "error", "reason": "Empty response"}

        return response.json()

    except Exception as e:
        return {"status": "error", "reason": str(e)}

def health_check():
    return safe_request("GET", "/health")

def check_inventory(medicine_name):
    return safe_request("GET", f"/inventory/{medicine_name}")

def create_order(customer_id, medicine_id, quantity):
    return safe_request(
        "POST",
        "/create-order",
        json={
            "customer_id": customer_id,
            "medicine_id": medicine_id,
            "quantity": quantity
        }
    )

def get_customer_history(customer_id):
    return safe_request("GET", f"/customer-history/{customer_id}")

def verify_prescription(customer_id, medicine_identifier):
    return safe_request(
        "POST",
        "/verify-prescription",
        json={
            "customer_id": str(customer_id),
            "medicine": str(medicine_identifier)
        }
    )

def check_prescription_status(customer_id, medicine_id):
    return safe_request(
        "GET",
        f"/prescription-status/{customer_id}/{medicine_id}"
    )

__all__ = [
    'health_check',
    'check_inventory',
    'create_order',
    'get_customer_history',
    'verify_prescription',
    'check_prescription_status'
]
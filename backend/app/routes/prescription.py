from flask import Blueprint, request, jsonify
from app.services.prescription_service import (
    verify_prescription,
    get_prescription_status
)

prescription_bp = Blueprint("prescription", __name__)


# -------------------------------------------------
# VERIFY PRESCRIPTION
# -------------------------------------------------
@prescription_bp.route("/verify-prescription", methods=["POST"])
def verify_prescription_route():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "code": "validation_error",
                "message": "Request body required"
            }), 400

        customer_id = data.get("customer_id")
        medicine = data.get("medicine")

        response, status = verify_prescription(customer_id, medicine)
        return jsonify(response), status

    except Exception:
        return jsonify({
            "status": "error",
            "code": "internal_error",
            "message": "Prescription verification failed"
        }), 500


# -------------------------------------------------
# PRESCRIPTION STATUS
# -------------------------------------------------
@prescription_bp.route("/prescription-status", methods=["POST"])
def prescription_status_route():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "code": "validation_error",
                "message": "Request body required"
            }), 400

        customer_id = data.get("customer_id")
        medicine = data.get("medicine")

        response, status = get_prescription_status(customer_id, medicine)
        return jsonify(response), status

    except Exception:
        return jsonify({
            "status": "error",
            "code": "internal_error",
            "message": "Prescription status check failed"
        }), 500
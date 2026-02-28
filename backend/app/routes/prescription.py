from flask import Blueprint, request, jsonify
from app.services.prescription_service import (
    get_prescription_status,
    upload_prescription,
    approve_prescription
)

prescription_bp = Blueprint("prescription", __name__)




# -------------------------------------------------
# UPLOAD PRESCRIPTION FILE
# -------------------------------------------------
@prescription_bp.route("/upload-prescription", methods=["POST"])
def upload_prescription_route():
    try:
        customer_id = request.form.get("customer_id")
        medicine_id = request.form.get("medicine_id")
        file = request.files.get("file")

        response, status = upload_prescription(customer_id, medicine_id, file)
        return jsonify(response), status

    except Exception:
        return jsonify({
            "status": "error",
            "code": "internal_error",
            "message": "Upload endpoint failed"
        }), 500


# -------------------------------------------------
# APPROVE / REJECT PRESCRIPTION (ADMIN)
# -------------------------------------------------
@prescription_bp.route("/approve-prescription", methods=["POST"])
def approve_prescription_route():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "code": "validation_error",
                "message": "Request body required"
            }), 400

        customer_id = data.get("customer_id")
        medicine_id = data.get("medicine_id")
        approve = data.get("approve", True)

        response, status = approve_prescription(customer_id, medicine_id, approve)
        return jsonify(response), status

    except Exception:
        return jsonify({
            "status": "error",
            "code": "internal_error",
            "message": "Approval endpoint failed"
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
        medicine_id = data.get("medicine_id")

        response, status = get_prescription_status(customer_id, medicine_id)
        return jsonify(response), status

    except Exception:
        return jsonify({
            "status": "error",
            "code": "internal_error",
            "message": "Prescription status check failed"
        }), 500
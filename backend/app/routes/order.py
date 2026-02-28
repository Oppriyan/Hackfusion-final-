from flask import Blueprint, request, jsonify
from app.services.order_service import create_order, get_customer_history

order_bp = Blueprint("order", __name__)


# -------------------------------------------------
# CREATE ORDER
# -------------------------------------------------
@order_bp.route("/create-order", methods=["POST"])
def create_order_route():

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
        quantity = data.get("quantity")

        # -------------------------
        # Input Validation Layer
        # -------------------------

        if not customer_id:
            return jsonify({
                "status": "error",
                "code": "validation_error",
                "message": "customer_id is required"
            }), 400

        if not medicine_id:
            return jsonify({
                "status": "error",
                "code": "validation_error",
                "message": "medicine_id is required"
            }), 400

        if not quantity:
            return jsonify({
                "status": "error",
                "code": "validation_error",
                "message": "quantity is required"
            }), 400

        try:
            quantity = int(quantity)
            if quantity <= 0:
                return jsonify({
                    "status": "error",
                    "code": "validation_error",
                    "message": "quantity must be greater than 0"
                }), 400
        except Exception:
            return jsonify({
                "status": "error",
                "code": "validation_error",
                "message": "quantity must be a number"
            }), 400

        # -------------------------
        # Business Logic Call
        # -------------------------

        response, status = create_order(customer_id, medicine_id, quantity)

        return jsonify(response), status

    except Exception:
     conn.rollback()
     conn.close()
    return {
        "status": "error",
        "code": "internal_error",
        "message": "Transaction failed"
    }, 500


# -------------------------------------------------
# CUSTOMER HISTORY
# -------------------------------------------------
@order_bp.route("/customer-history/<customer_id>", methods=["GET"])
def customer_history_route(customer_id):

    try:
        response, status = get_customer_history(customer_id)
        return jsonify(response), status

    except Exception:
        return jsonify({
            "status": "error",
            "code": "internal_error",
            "message": "Customer history endpoint failed"
        }), 500
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

        response, status = create_order(customer_id, medicine_id, quantity)
        return jsonify(response), status

    except Exception:
        return jsonify({
            "status": "error",
            "code": "internal_error",
            "message": "Order endpoint failed"
        }), 500


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
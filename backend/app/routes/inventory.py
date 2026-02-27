from flask import Blueprint, jsonify, request
from app.services.inventory_service import check_inventory, update_stock

inventory_bp = Blueprint("inventory", __name__)


# -------------------------------------------------
# GET INVENTORY
# -------------------------------------------------
@inventory_bp.route("/inventory/<medicine>", methods=["GET"])
def inventory(medicine):
    try:
        response, status_code = check_inventory(medicine)
        return jsonify(response), status_code
    except Exception:
        return jsonify({
            "status": "error",
            "code": "internal_error",
            "message": "Inventory endpoint failed"
        }), 500


# -------------------------------------------------
# UPDATE STOCK (ADMIN)
# -------------------------------------------------
@inventory_bp.route("/update-stock", methods=["POST"])
def update_stock_route():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "code": "validation_error",
                "message": "Request body required"
            }), 400

        medicine = data.get("medicine")
        delta = data.get("delta")

        response, status = update_stock(medicine, delta)
        return jsonify(response), status

    except Exception:
        return jsonify({
            "status": "error",
            "code": "internal_error",
            "message": "Stock update endpoint failed"
        }), 500
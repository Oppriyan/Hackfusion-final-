# agents/core/controller.py

from agents.tools.tools import (
    check_inventory,
    create_order,
    verify_prescription,
    get_customer_history,
    update_stock
)


def handle_intent(request):

    if not request:
        return {"status": "error", "message": "Invalid request"}

    intent = request.intent
    customer_id = request.customer_id or "PAT001"
    medicine = request.medicine_name
    quantity = request.quantity or 1
    delta = request.delta

    # ==================================================
    # INVENTORY
    # ==================================================
    if intent == "inventory":

        if not medicine:
            return {"status": "error", "message": "Medicine name required"}

        return check_inventory(medicine)

    # ==================================================
    # ORDER FLOW
    # ==================================================
    if intent == "order":

        if not medicine:
            return {"status": "error", "message": "Medicine name required"}

        quantity = quantity if quantity and quantity > 0 else 1

        inventory = check_inventory(medicine)

        if inventory.get("status") != "success":
            return inventory

        data_list = inventory.get("data", [])

        if not data_list:
            return {"status": "error", "code": "not_found", "message": "Medicine not found"}

        medicine_data = data_list[0]

        medicine_id = medicine_data.get("medicine_id")
        prescription_required = medicine_data.get("prescription_required") == "Yes"

        if prescription_required:

            verify = verify_prescription(customer_id, medicine_id)

            if verify.get("status") != "success":
                return {
                    "status": "error",
                    "code": "prescription_required",
                    "message": "Valid prescription required"
                }

        return create_order(customer_id, medicine, quantity)

    # ==================================================
    # HISTORY
    # ==================================================
    if intent == "history":
        return get_customer_history(customer_id)

    # ==================================================
    # UPDATE STOCK
    # ==================================================
    if intent == "update_stock":

        if not medicine or delta is None:
            return {"status": "error", "message": "Medicine and stock delta required"}

        return update_stock(medicine, delta)

    # ==================================================
    # SMALLTALK
    # ==================================================
    if intent == "smalltalk":
        return {"status": "smalltalk"}

    return {"status": "error", "message": "Unknown intent"}
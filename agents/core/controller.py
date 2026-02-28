# agents/core/controller.py

from langsmith import traceable

from agents.tools.tools import (
    check_inventory,
    create_order,
    verify_prescription,
    check_prescription_status,
    get_customer_history,
    cancel_order,
    get_order_status,
    search_medicines
)

def handle_intent(request, user_input=None):
    
    if not request:
        return {"status": "error", "message": "Invalid request"}

    intent = request.intent
    customer_id = request.customer_id or "PAT001"
    medicine = request.medicine_name
    quantity = request.quantity

    user_input_lower = user_input.lower() if user_input else ""

    # ==================================================
    # HARD MAPPED COMMANDS (No LLM risk)
    # ==================================================

    # CANCEL ORDER
    if "cancel order" in user_input_lower:
        try:
            order_id = int(user_input_lower.split("cancel order")[1].strip())
            return cancel_order(order_id)
        except:
            return {"status": "error", "message": "Invalid order ID"}

    # ORDER STATUS
    if "order status" in user_input_lower:
        try:
            order_id = int(user_input_lower.split("order status")[1].strip())
            return get_order_status(order_id)
        except:
            return {"status": "error", "message": "Invalid order ID"}

    # SEARCH MEDICINES
    if "search" in user_input_lower:
        try:
            query = user_input_lower.split("search")[1].strip()
            return search_medicines(query)
        except:
            return {"status": "error", "message": "Invalid search query"}

    # ==================================================
    # INVENTORY
    # ==================================================
    if intent == "inventory":

        if not medicine:
            return {"status": "error", "code": "missing_medicine"}

        return check_inventory(medicine)

    # ==================================================
    # ORDER
    # ==================================================
    if intent == "order":

        if not medicine:
            return {"status": "error", "code": "missing_medicine"}

        if quantity is None or quantity <= 0:
            return {
                "status": "error",
                "code": "invalid_quantity",
                "message": "Quantity must be greater than 0"
            }

        inventory = check_inventory(medicine)

        if inventory.get("status") != "success":
            return inventory

        data_list = inventory.get("data", [])

        if not data_list:
            return {"status": "error", "code": "not_found"}

        item = data_list[0]

        medicine_id = item.get("medicine_id")
        prescription_required = item.get("prescription_required") == "Yes"

        if prescription_required:
            status_check = check_prescription_status(
                customer_id,
                item.get("name")
            )

            if status_check.get("status") != "valid":
                return {
                    "status": "error",
                    "code": "prescription_required"
                }

        return create_order(customer_id, medicine_id, quantity)

    # ==================================================
    # UPLOAD PRESCRIPTION
    # ==================================================
    if intent == "upload_prescription":

        if not medicine:
            return {"status": "error", "code": "missing_medicine"}

        inventory = check_inventory(medicine)

        if inventory.get("status") != "success":
            return inventory

        data_list = inventory.get("data", [])

        if not data_list:
            return {"status": "error", "code": "not_found"}

        item = data_list[0]
        medicine_name = item.get("name")

        return verify_prescription(customer_id, medicine_name)

    # ==================================================
    # HISTORY
    # ==================================================
    if intent == "history":
        return get_customer_history(customer_id)

    # ==================================================
    # SMALLTALK
    # ==================================================
    return {"status": "smalltalk"}
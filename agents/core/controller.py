# agents/core/controller.py

from agents.tools.tools import (
    check_inventory,
    create_order,
    verify_prescription,
    check_prescription_status,
    get_customer_history
)

def handle_intent(request):

    if not request:
        return {"status": "error", "message": "Invalid request"}

    intent = request.intent
    customer_id = request.customer_id or "PAT001"
    medicine = request.medicine_name
    quantity = request.quantity

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

        # 🔥 DEBUG structured quantity
        print("DEBUG ORDER QUANTITY:", quantity)

        if quantity is None:
            quantity = 1

        if quantity <= 0:
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
        medicine_name = item.get("name")
        prescription_required = item.get("prescription_required") == "Yes"

        # 🔥 FIXED: Use medicine NAME for prescription check
        if prescription_required:
            status_check = check_prescription_status(customer_id, medicine_name)

            print("DEBUG PRESCRIPTION STATUS:", status_check)

            if not status_check.get("data", {}).get("verified"):
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

        print("DEBUG UPLOAD MEDICINE NAME:", medicine_name)

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
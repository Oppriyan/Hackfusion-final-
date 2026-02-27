# agents/core/controller.py
from agents.tools.tools import check_inventory, create_order, verify_prescription, get_customer_history

def handle_intent(request):
    if not request: return {"status": "error", "response": "Invalid request"}

    intent = request.intent
    customer_id = "PAT001"
    query = request.medicine_name
    qty = request.quantity or 1

    if intent == "inventory":
        if not query: return {"status": "error", "response": "Medicine name required"}
        return check_inventory(query)

    if intent == "order":
        if not query: return {"status": "error", "response": "Medicine name required"}

        # 1. Resolve exact name and prescription status
        inv = check_inventory(query)
        if inv.get("status") != "success" or not inv.get("data"):
            return {"status": "success", "response": "Medicine not found."}

        # Handle list or single object
        med_list = inv.get("data")
        med_data = med_list[0] if isinstance(med_list, list) else med_list
        
        exact_name = med_data.get("name")
        med_id = med_data.get("medicine_id")
        needs_presc = med_data.get("prescription_required") == "Yes"

        # 2. Check Prescription
        if needs_presc:
            v = verify_prescription(customer_id, med_id)
            if v.get("status") != "success":
                return {"status": "success", "response": "A valid prescription is required for this medicine."}

        # 3. Place Order with EXACT name
        return create_order(customer_id, exact_name, qty)

    if intent == "history":
        return get_customer_history(customer_id)

    return {"status": "smalltalk"}

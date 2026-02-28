# agents/core/controller.py

from agents.tools.tools import (
    check_inventory,
    create_order,
    update_stock,
    get_customer_history
)
from agents.core.memory import save_last_medicine, get_last_medicine
from agents.core.prescription_rules import requires_prescription
from agents.tools.webhook import trigger_admin_alert
from agents.core.predictor import check_monthly_limit
from agents.core.prescription_memory import is_prescription_verified, mark_prescription_verified

def handle_intent(request):
    # Default customer ID if none provided
    customer_id = request.customer_id or "PAT001"

    # ---------------------------------------------------------
    # INTENT: ORDER MEDICINE
    # ---------------------------------------------------------
    if request.intent == "order":
        # Auto-fill from memory if medicine name is missing
        if not request.medicine_name:
            last_medicine = get_last_medicine(customer_id)
            if last_medicine:
                request.medicine_name = last_medicine

        # 1. Prescription Enforcement
        if requires_prescription(request.medicine_name) and not is_prescription_verified(customer_id, request.medicine_name):
            trigger_admin_alert(
                "prescription_blocked",
                {
                    "customer_id": customer_id,
                    "medicine": request.medicine_name
                }
            )
            return {"status": "rejected", "reason": "prescription_required"}

        # 2. Monthly Limit Enforcement
        limit_check = check_monthly_limit(
            customer_id,
            request.medicine_name,
            request.quantity
        )
        if not limit_check.get("allowed"):
            trigger_admin_alert(
                "monthly_limit_exceeded",
                {
                    "customer_id": customer_id,
                    "medicine": request.medicine_name,
                    "current_usage": limit_check.get("current_usage"),
                    "max_limit": limit_check.get("max_limit")
                }
            )
            return {
                "status": "rejected", 
                "reason": "monthly_limit_exceeded", 
                "details": limit_check
            }

        # 3. Inventory Check
        inventory = check_inventory(request.medicine_name)
        if inventory.get("status") != "ok":
            return inventory

        if not inventory.get("available"):
            trigger_admin_alert("out_of_stock", {"medicine": request.medicine_name})
            return inventory

        # 4. Process Order
        order = create_order(
            customer_id,
            request.medicine_name,
            request.quantity
        )

        if order.get("status") == "rejected" and order.get("reason") == "insufficient_stock":
            trigger_admin_alert(
                "insufficient_stock_attempt",
                {
                    "medicine": request.medicine_name,
                    "requested_quantity": request.quantity,
                    "available_stock": order.get("available_stock")
                }
            )

        if order.get("status") == "created":
            save_last_medicine(customer_id, request.medicine_name)
            trigger_admin_alert(
                "order_created",
                {
                    "order_id": order.get("order_id"),
                    "customer_id": customer_id,
                    "customer_name": "Priyanshu",
                    "medicine": order.get("medicine"),
                    "quantity": order.get("quantity"),
                    "date": order.get("date"),
                    "total_price": order.get("total_price")
                }
            )

            # Low stock warning after order
            if inventory.get("stock") is not None and inventory.get("stock") <= 5:
                trigger_admin_alert(
                    "low_stock_warning",
                    {
                        "medicine": request.medicine_name,
                        "remaining_stock": inventory.get("stock")
                    }
                )

        return order

    # ---------------------------------------------------------
    # INTENT: UPLOAD PRESCRIPTION
    # ---------------------------------------------------------
    elif request.intent == "upload_prescription":
        if not request.medicine_name:
            return {"status": "error", "reason": "medicine_required_for_prescription"}

        mark_prescription_verified(customer_id, request.medicine_name)
        trigger_admin_alert(
            "prescription_verified",
            {"customer_id": customer_id, "medicine": request.medicine_name}
        )
        return {"status": "verified", "medicine": request.medicine_name}

    # ---------------------------------------------------------
    # INTENT: INVENTORY CHECK
    # ---------------------------------------------------------
    elif request.intent == "inventory":
        return check_inventory(request.medicine_name)

    # ---------------------------------------------------------
    # INTENT: ORDER HISTORY
    # ---------------------------------------------------------
    elif request.intent == "history":
        return get_customer_history(customer_id)

    # ---------------------------------------------------------
    # INTENT: UPDATE STOCK (ADMIN)
    # ---------------------------------------------------------
    elif request.intent == "update_stock":
        # Validate inputs before calling tool
        if not request.medicine_name or request.delta is None:
            return {"status": "error", "reason": "missing_data_for_update"}

        update = update_stock(request.medicine_name, request.delta)

        if update.get("status") == "updated":
            trigger_admin_alert(
                "stock_updated",
                {
                    "medicine": update.get("medicine"),
                    "new_stock": update.get("stock")
                }
            )
        return update

    # ---------------------------------------------------------
    # INTENT: SMALLTALK
    # ---------------------------------------------------------
    elif request.intent == "smalltalk":
        return {"status": "smalltalk"}

    return {"status": "error", "reason": "unknown_intent"}

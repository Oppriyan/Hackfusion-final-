# app/services/agent_service.py

# -------------------------------------------
# INTENT DETECTION
# -------------------------------------------

def detect_intent(message: str):

    message = message.lower()

    if any(word in message for word in ["buy", "order", "purchase"]):
        return "create_order"

    if any(word in message for word in ["history", "past orders"]):
        return "order_history"

    if any(word in message for word in ["verify prescription", "upload prescription"]):
        return "verify_prescription"

    if any(word in message for word in ["available", "stock", "have"]):
        return "check_inventory"

    return "check_inventory"  # Safe fallback


# -------------------------------------------
# MAIN ORCHESTRATOR
# -------------------------------------------

def process_chat_message(message: str):

    # -------------------------
    # Validation
    # -------------------------
    if not message or not isinstance(message, str):
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Message is required"
        }, 400

    message = message.strip()

    if not message:
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Message cannot be empty"
        }, 400

    try:

        intent = detect_intent(message)

        if intent == "check_inventory":
            response_text = handle_inventory(message)

        elif intent == "create_order":
            response_text = handle_create_order(message)

        elif intent == "order_history":
            response_text = handle_history(message)

        elif intent == "verify_prescription":
            response_text = handle_prescription(message)

        else:
            response_text = "I couldn't understand your request."

        return {
            "status": "success",
            "data": {
                "intent": intent,
                "reply": response_text
            }
        }, 200

    except Exception:
        return {
            "status": "error",
            "code": "internal_error",
            "message": "Agent processing failed"
        }, 500


# -------------------------------------------
# HANDLERS (FOUNDATION STUBS)
# -------------------------------------------

def handle_inventory(message: str):
    return "Inventory intent detected."


def handle_create_order(message: str):
    return "Order intent detected."


def handle_history(message: str):
    return "Order history intent detected."


def handle_prescription(message: str):
    return "Prescription verification intent detected."
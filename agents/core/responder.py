# agents/core/responder.py

def generate_response(user_input, tool_result, prediction=None):

    if not isinstance(tool_result, dict):
        return "I couldn’t process that request."

    status = tool_result.get("status")
    code = tool_result.get("code")
    data = tool_result.get("data")

    # =====================================================
    # 1️⃣ SMALLTALK
    # =====================================================
    if status == "smalltalk":
        return "Hello! How can I assist you with your pharmacy needs today?"

    # =====================================================
    # 2️⃣ INVENTORY RESPONSE
    # =====================================================
    if status == "success" and isinstance(data, list):

        if not data:
            return "Medicine not found."

        item = data[0]

        return (
            f"{item.get('name')} is available.\n"
            f"Price: €{item.get('price')}\n"
            f"Stock: {item.get('stock')} units.\n"
            f"Prescription Required: {item.get('prescription_required')}"
        )

    # =====================================================
    # 3️⃣ ORDER SUCCESS
    # =====================================================
    if status == "success" and isinstance(data, dict) and data.get("order_id"):

        return (
            f"Your order has been successfully placed.\n"
            f"Medicine: {data.get('medicine')}\n"
            f"Quantity: {data.get('quantity')}\n"
            f"Total Price: €{data.get('total_price')}"
        )

    # =====================================================
    # 4️⃣ HISTORY RESPONSE
    # =====================================================
    if status == "success" and isinstance(data, list):

        if not data:
            return "You have no previous orders."

        response_lines = ["Here are your previous orders:"]
        for order in data:
            response_lines.append(
                f"- {order.get('medicine')} | "
                f"Quantity: {order.get('quantity')} | "
                f"Date: {order.get('purchase_date')}"
            )

        return "\n".join(response_lines)

    # =====================================================
    # 5️⃣ ERROR HANDLING
    # =====================================================

    if code == "not_found":
        return "Medicine not found."

    if code == "insufficient_stock":
        return "Insufficient stock available."

    if code == "prescription_required":
        return "A valid prescription is required for this medicine."

    if status == "error":
        return tool_result.get("message", "Something went wrong.")

    # =====================================================
    # 6️⃣ FALLBACK
    # =====================================================
    return "I’m here to help with medicine availability, orders, and prescriptions. Please let me know how I can assist you."
# agents/core/responder.py

def generate_response(user_input, tool_result, prediction=None):

    if not isinstance(tool_result, dict):
        return "Something went wrong."

    status = tool_result.get("status")
    code = tool_result.get("code")
    data = tool_result.get("data")

    # SMALLTALK
    if status == "smalltalk":
        return "Hello! How can I assist you with your pharmacy needs today?"

    # PRESCRIPTION VERIFIED
    if status == "verified":
        return f"Prescription successfully verified. Valid until {tool_result.get('valid_until')}."

    # SUCCESS RESPONSES
    if status == "success":

        if isinstance(data, list):

            if not data:
                return "No records found."

            first = data[0]

            # INVENTORY
            if "price" in first:
                return (
                    f"{first.get('name')} is available.\n"
                    f"Price: €{first.get('price')}\n"
                    f"Stock: {first.get('stock')} units.\n"
                    f"Prescription Required: {first.get('prescription_required')}"
                )

            # HISTORY (FIXED — using 'date')
            if "date" in first:
                lines = ["Here are your previous orders:"]
                for order in data:
                    lines.append(
                        f"- {order.get('medicine')} | "
                        f"Quantity: {order.get('quantity')} | "
                        f"Date: {order.get('date')} | "
                        f"Total: €{order.get('total_price')}"
                    )
                return "\n".join(lines)

        # ORDER SUCCESS
        if isinstance(data, dict) and data.get("order_id"):
            return (
                f"Your order has been successfully placed.\n"
                f"Medicine: {data.get('medicine')}\n"
                f"Quantity: {data.get('quantity')}\n"
                f"Total Price: €{data.get('total_price')}"
            )

    # ERROR RESPONSES
    if code == "not_found":
        return "Medicine not found."

    if code == "insufficient_stock":
        return "Insufficient stock available."

    if code == "prescription_required":
        return "This medicine requires a valid prescription. Please upload it first."

    if code == "invalid_quantity":
        return "Quantity must be greater than 0."

    if status == "error":
        return tool_result.get("message", "Something went wrong.")

    return "I’m here to help with medicine availability, orders, and prescriptions."
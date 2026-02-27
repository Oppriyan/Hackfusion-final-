from flask import Blueprint, request, jsonify
from app.services.agent_service import process_chat_message

webhook_bp = Blueprint("webhook", __name__)


@webhook_bp.route("/vapi-webhook", methods=["POST"])
def vapi_webhook():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "response": "Invalid request body."
            }), 400

        message_content = None

        # Case 1: Nested VAPI structure
        if isinstance(data.get("message"), dict):
            message_content = data["message"].get("content")

        # Case 2: Simple JSON format
        elif isinstance(data.get("message"), str):
            message_content = data.get("message")

        if not message_content:
            return jsonify({
                "response": "No speech detected."
            }), 200

        response, status = process_chat_message(message_content)

        if status == 200:
            return jsonify({
                "response": response["data"]["reply"]
            }), 200
        else:
            return jsonify({
                "response": response.get("message", "Something went wrong.")
            }), 200

    except Exception:
        return jsonify({
            "response": "Server error occurred."
        }), 200
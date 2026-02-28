from agents.core.extractor import extract_structured_request
from agents.core.controller import handle_intent
from agents.core.responder import generate_response
from agents.core.predictor import analyze_refill_opportunity


def run_agent(user_input: str):
    try:
        customer_id = "PAT001"

        # -------------------------------
        # Intent Extraction
        # -------------------------------
        try:
            structured = extract_structured_request(user_input)
        except Exception:
            return {
                "status": "success",
                "response": "I can help you with medicines, prescriptions, and orders. What do you need?"
            }

        # -------------------------------
        # Backend Handling
        # -------------------------------
        try:
            backend_result = handle_intent(structured) or {}
        except Exception:
            backend_result = {}

        # -------------------------------
        # Predictive Intelligence
        # -------------------------------
        try:
            prediction = analyze_refill_opportunity(customer_id) or {}
        except Exception:
            prediction = {}

        # -------------------------------
        # Final Response Generation
        # -------------------------------
        try:
            final_response = generate_response(
                user_input,
                backend_result,
                prediction
            )
        except Exception:
            final_response = (
                "I can help you with information about medicines, "
                "availability, and prescriptions. Please tell me what you need."
            )

        return {
            "status": "success",
            "response": final_response
        }

    except Exception:
        return {
            "status": "success",
            "response": "How can I help you with your pharmacy needs today?"
        }
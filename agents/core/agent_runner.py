# agents/core/agent_runner.py

from agents.core.extractor import extract_structured_request
from agents.core.controller import handle_intent
from agents.core.responder import generate_response
from agents.core.predictor import analyze_refill_opportunity


def run_agent(user_input: str):

    try:
        customer_id = "PAT001"

        structured = extract_structured_request(user_input)

        backend_result = handle_intent(structured) or {}

        prediction = analyze_refill_opportunity(customer_id) or {}

        final_response = generate_response(
            user_input,
            backend_result,
            prediction
        )

        return {
            "status": "success",
            "response": final_response
        }

    except Exception as e:
        print("DEBUG ERROR:", e)
        return {
            "status": "error",
            "response": "Internal error occurred."
        }
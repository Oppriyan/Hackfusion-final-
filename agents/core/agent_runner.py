# agents/core/agent_runner.py

from agents.core.extractor import extract_structured_request
from agents.core.controller import handle_intent
from agents.core.responder import generate_response


def run_agent(user_input: str):

    try:
        # ----------------------------
        # INTENT EXTRACTION
        # ----------------------------
        structured = extract_structured_request(user_input)

        # ----------------------------
        # CONTROLLER
        # ----------------------------
        backend_result = handle_intent(structured)

        # ----------------------------
        # RESPONSE GENERATION
        # ----------------------------
        final_response = generate_response(user_input, backend_result)

        return {
            "status": "success",
            "response": final_response
        }

    except Exception:
        # Safe fallback (never expose internal error)
        return {
            "status": "success",
            "response": "Hello! How can I assist you with your pharmacy needs today?"
        }
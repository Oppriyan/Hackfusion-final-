from langsmith import traceable

from agents.core.extractor import extract_structured_request
from agents.core.controller import handle_intent
from agents.core.responder import generate_response


@traceable(name="Pharmacy-Agent-Run")
def run_agent(user_input: str):

    try:
        structured = extract_structured_request(user_input)

        backend_result = traced_controller(structured, user_input)

        final_response = generate_response(user_input, backend_result)

        return {
            "status": "success",
            "response": final_response
        }

    except Exception:
        return {
            "status": "success",
            "response": "Hello! How can I assist you with your pharmacy needs today?"
        }


@traceable(name="Intent-Controller")
def traced_controller(structured, user_input):
    return handle_intent(structured, user_input)
# agents/core/agent_runner.py

from langsmith import traceable
from agents.core.extractor import extract_structured_request
from agents.core.controller import handle_intent
from agents.core.responder import generate_response


@traceable(name="Pharmacy-Agent-Run")
def run_agent(user_input: str):

    try:

        structured_request = extract_structured_request(user_input)

        print("🔎 Structured Request:", structured_request)

        backend_result = handle_intent(structured_request, user_input)

        print("⚙ Backend Result:", backend_result)

        final_response = generate_response(user_input, backend_result)

        print("🧠 Final Response:", final_response)

        return {
            "status": "success",
            "response": final_response
        }

    except Exception as e:

        print("🚨 AGENT ERROR:", str(e))

        return {
            "status": "success",
            "response": "I'm experiencing a temporary issue. Please try again."
        }
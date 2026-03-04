from langsmith import traceable
from agents.core.extractor import extract_structured_request
from agents.core.controller import handle_intent
from agents.core.responder import generate_response


@traceable(name="Pharmacy-Agent-Run")
def run_agent(user_input: str):

    try:
        # ================================
        # 1️⃣ Extract structured intent
        # ================================
        structured = extract_structured_request(user_input)
        print("🔎 Structured Request:", structured)

        # ================================
        # 2️⃣ Handle business logic
        # ================================
        backend_result = traced_controller(structured, user_input)
        print("⚙ Backend Result:", backend_result)

        # ================================
        # 3️⃣ Generate final response
        # ================================
        final_response = generate_response(user_input, backend_result)
        print("🧠 Final Response:", final_response)

        return {
            "status": "success",
            "response": final_response
        }

    except Exception as e:
        print("🚨 AGENT ERROR:", str(e))

        return {
            "status": "error",
            "response": "I'm experiencing a temporary issue. Please try again."
        }


@traceable(name="Intent-Controller")
def traced_controller(structured, user_input):
    return handle_intent(structured, user_input)
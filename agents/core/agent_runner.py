from langsmith import traceable
from agents.core.extractor import extract_structured_request, StructuredRequest
from agents.core.controller import handle_intent
from agents.core.responder import generate_response

@traceable(name="Pharmacy-Agent-Run")
def run_agent(user_input: str):

    try:
<<<<<<< HEAD
        # Step 1: Extract structured intent
        structured = extract_structured_request(user_input)
        print("🔎 Structured Request:", structured)

        # Step 2: Handle business logic
        backend_result = traced_controller(structured, user_input)
        print("⚙ Backend Result:", backend_result)

        # Step 3: Generate final response
=======
        # 1️⃣ Extract
        structured_dict = extract_structured_request(user_input)

        # Rebuild Pydantic object for controller
        structured = StructuredRequest(**structured_dict)

        # 2️⃣ Controller
        backend_result = handle_intent(structured, user_input)

        # 3️⃣ Response
>>>>>>> 9ade7a05e19af9cec6ef936db098a6666ebbf98f
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
<<<<<<< HEAD
            "response": "I'm experiencing a temporary issue. Please try again."
        }


@traceable(name="Intent-Controller")
def traced_controller(structured, user_input):
    return handle_intent(structured, user_input)
=======
            "response": "Hello! How can I assist you with your pharmacy needs today?"
        }
>>>>>>> 9ade7a05e19af9cec6ef936db098a6666ebbf98f

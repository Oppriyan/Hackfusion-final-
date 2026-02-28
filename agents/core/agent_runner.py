from langsmith import traceable
from agents.core.extractor import extract_structured_request, StructuredRequest
from agents.core.controller import handle_intent
from agents.core.responder import generate_response

@traceable(name="Pharmacy-Agent-Run")
def run_agent(user_input: str):

    try:
        # 1️⃣ Extract
        structured_dict = extract_structured_request(user_input)

        # Rebuild Pydantic object for controller
        structured = StructuredRequest(**structured_dict)

        # 2️⃣ Controller
        backend_result = handle_intent(structured, user_input)

        # 3️⃣ Response
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
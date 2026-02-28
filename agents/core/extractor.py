import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI
from pydantic import BaseModel
from typing import Optional

load_dotenv()


# -------------------------------------------------
# Strict Intent Enum
# -------------------------------------------------
ALLOWED_INTENTS = {
    "order",
    "inventory",
    "history",
    "update_stock",
    "upload_prescription",
    "smalltalk"
}


# -------------------------------------------------
# Structured Request Model
# -------------------------------------------------
class StructuredRequest(BaseModel):
    intent: Optional[str] = "smalltalk"
    medicine_name: Optional[str] = None
    quantity: Optional[int] = None
    delta: Optional[int] = None
    customer_id: Optional[str] = None


client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)


# -------------------------------------------------
# Public Entry
# -------------------------------------------------
def extract_structured_request(user_input: str) -> StructuredRequest:

    raw = _llm_extract(user_input)
    normalized = _normalize_and_validate(raw)

    return StructuredRequest(**normalized)


# -------------------------------------------------
# LLM Extraction
# -------------------------------------------------
def _llm_extract(user_input: str) -> dict:

    system_prompt = """
You are a STRICT pharmacy intent extraction engine.

Return ONLY valid JSON in this exact format:

{
  "intent": "order | inventory | history | update_stock | upload_prescription | smalltalk",
  "medicine_name": string or null,
  "quantity": integer or null,
  "delta": integer or null,
  "customer_id": string or null
}

Rules:
- Buying or ordering medicine → order
- Checking availability → inventory
- Asking about previous orders → history
- Increasing/reducing stock → update_stock
- Uploading prescription → upload_prescription
- Greetings/unclear → smalltalk

If unsure → smalltalk.
Return ONLY JSON.
"""

    try:
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            temperature=0
        )

        content = response.choices[0].message.content.strip()
        return json.loads(content)

    except Exception:
        return {
            "intent": "smalltalk",
            "medicine_name": None,
            "quantity": None,
            "delta": None,
            "customer_id": None
        }


# -------------------------------------------------
# Normalization Layer
# -------------------------------------------------
def _normalize_and_validate(data: dict) -> dict:

    intent = _normalize_intent(data.get("intent"))
    medicine = _sanitize_text(data.get("medicine_name"))
    quantity = _sanitize_quantity(data.get("quantity"))
    delta = _sanitize_delta(data.get("delta"))
    customer_id = _sanitize_text(data.get("customer_id"))

    if intent == "order" and not medicine:
        intent = "smalltalk"

    if intent == "inventory" and not medicine:
        intent = "smalltalk"

    if intent == "update_stock" and (not medicine or delta is None):
        intent = "smalltalk"

    if intent == "upload_prescription" and not medicine:
        intent = "smalltalk"

    if intent == "history":
        medicine = None
        quantity = None
        delta = None

    return {
        "intent": intent,
        "medicine_name": medicine,
        "quantity": quantity,
        "delta": delta,
        "customer_id": customer_id
    }


# -------------------------------------------------
# Field Sanitizers
# -------------------------------------------------
def _normalize_intent(intent: Optional[str]) -> str:
    if not intent:
        return "smalltalk"

    intent = intent.strip().lower()

    if intent not in ALLOWED_INTENTS:
        return "smalltalk"

    return intent


def _sanitize_text(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = value.strip()
    return value if value else None


def _sanitize_quantity(value: Optional[int]) -> Optional[int]:
    try:
        value = int(value)
        if value <= 0:
            return 1
        if value > 100:
            return 100
        return value
    except Exception:
        return 1


def _sanitize_delta(value: Optional[int]) -> Optional[int]:
    try:
        value = int(value)
        if abs(value) > 1000:
            return None
        return value
    except Exception:
        return None
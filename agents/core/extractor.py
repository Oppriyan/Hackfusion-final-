# agents/core/extractor.py

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
You are a pharmacy intent extraction engine.

Return ONLY JSON in this format:

{
  "intent": "order | inventory | history | update_stock | upload_prescription | smalltalk",
  "medicine_name": string or null,
  "quantity": integer or null,
  "delta": integer or null,
  "customer_id": string or null
}

Rules:
- order → requires medicine_name
- inventory → requires medicine_name
- history → no medicine required
- update_stock → requires medicine_name + delta
- upload_prescription → requires medicine_name
- greetings → smalltalk

If unsure, choose smalltalk.
Return ONLY valid JSON.
"""

    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        temperature=0
    )

    try:
        return json.loads(response.choices[0].message.content.strip())
    except Exception:
        return {
            "intent": "smalltalk",
            "medicine_name": None,
            "quantity": None,
            "delta": None,
            "customer_id": None
        }


# -------------------------------------------------
# Enterprise Normalization Layer
# -------------------------------------------------
def _normalize_and_validate(data: dict) -> dict:

    intent = _normalize_intent(data.get("intent"))
    medicine = _sanitize_text(data.get("medicine_name"))
    quantity = _sanitize_quantity(data.get("quantity"))
    delta = _sanitize_delta(data.get("delta"))
    customer_id = _sanitize_text(data.get("customer_id"))

    # -------------------------
    # Intent Downgrade Logic
    # -------------------------

    if intent == "order" and not medicine:
        intent = "smalltalk"

    if intent == "inventory" and not medicine:
        intent = "smalltalk"

    if intent == "update_stock" and not medicine:
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
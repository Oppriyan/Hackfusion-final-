# agents/core/extractor.py

import os
import json
import re
from dotenv import load_dotenv
from openai import AzureOpenAI
from langsmith import traceable
from agents.models.schemas import StructuredRequest

load_dotenv()

ALLOWED_INTENTS = {
    "order",
    "inventory",
    "history",
    "upload_prescription",
    "smalltalk"
}

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)

@traceable(name="Intent-Extraction")
def extract_structured_request(user_input: str) -> StructuredRequest:

    if not user_input or not isinstance(user_input, str):
        return StructuredRequest(intent="smalltalk")

    user_input_lower = user_input.lower()

    system_prompt = """
You are a strict pharmacy intent extractor.

Return ONLY valid JSON in this format:

{
  "intent": "order | inventory | history | upload_prescription | smalltalk",
  "medicine_name": string or null,
  "quantity": integer or null,
  "customer_id": string or null
}

CRITICAL RULES:
- Preserve numeric values EXACTLY as written.
- Do NOT auto-correct quantity.
- Do NOT invent missing numbers.
Return JSON only.
"""

    # ==================================================
    # TRY AZURE LLM FIRST
    # ==================================================

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
        parsed = json.loads(content)

        intent = parsed.get("intent", "smalltalk")

        if intent not in ALLOWED_INTENTS:
            intent = "smalltalk"

        quantity = parsed.get("quantity")

        try:
            quantity = int(quantity) if quantity is not None else None
        except Exception:
            quantity = None

        return StructuredRequest(
            intent=intent,
            medicine_name=parsed.get("medicine_name"),
            quantity=quantity,
            customer_id=parsed.get("customer_id")
        )

    except Exception as e:
        print("⚠ Azure extractor failed, using fallback parser.")
        print("Error:", str(e))

    # ==================================================
    # 🔥 FALLBACK RULE-BASED PARSER (DEMO SAFE)
    # ==================================================

    # ORDER: order 2 paracetamol
    order_match = re.search(r"order\s+(-?\d+)\s+([a-zA-Z\s]+)", user_input_lower)
    if order_match:
        quantity = int(order_match.group(1))
        medicine = order_match.group(2).strip()
        return StructuredRequest(
            intent="order",
            medicine_name=medicine,
            quantity=quantity,
            customer_id=None
        )

    # INVENTORY
    if "inventory" in user_input_lower:
        medicine = user_input_lower.replace("check inventory", "").strip()
        return StructuredRequest(
            intent="inventory",
            medicine_name=medicine,
            quantity=None,
            customer_id=None
        )

    # HISTORY
    if "history" in user_input_lower:
        return StructuredRequest(intent="history")

    # UPLOAD PRESCRIPTION
    if "upload" in user_input_lower:
        return StructuredRequest(intent="upload_prescription")

    # DEFAULT
    return StructuredRequest(intent="smalltalk")
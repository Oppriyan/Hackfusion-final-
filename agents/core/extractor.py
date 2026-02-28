# agents/core/extractor.py

import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI
from pydantic import BaseModel
from typing import Optional

load_dotenv()

ALLOWED_INTENTS = {
    "order",
    "inventory",
    "history",
    "upload_prescription",
    "smalltalk"
}

class StructuredRequest(BaseModel):
    intent: Optional[str] = "smalltalk"
    medicine_name: Optional[str] = None
    quantity: Optional[int] = None
    customer_id: Optional[str] = None

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)

def extract_structured_request(user_input: str) -> StructuredRequest:

    if not user_input or not isinstance(user_input, str):
        return StructuredRequest(intent="smalltalk")

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
- Preserve numeric values EXACTLY as written by the user.
- If the user provides -5, return -5.
- Do NOT convert negative numbers to positive.
- Do NOT auto-correct quantity.
- Do NOT invent missing numbers.

Intent rules:
- Buying medicine → order
- Checking availability → inventory
- Asking past orders → history
- Uploading prescription → upload_prescription
- Greetings or unclear → smalltalk

Return JSON only.
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
        parsed = json.loads(content)

    except Exception:
        return StructuredRequest(intent="smalltalk")

    intent = parsed.get("intent", "smalltalk")

    if intent not in ALLOWED_INTENTS:
        intent = "smalltalk"

    quantity = parsed.get("quantity")

    try:
        quantity = int(quantity)

        # Do NOT auto-fix negative values
        if quantity > 100:
            quantity = 100

    except Exception:
        quantity = None

    return StructuredRequest(
        intent=intent,
        medicine_name=parsed.get("medicine_name"),
        quantity=quantity,
        customer_id=parsed.get("customer_id")
    )
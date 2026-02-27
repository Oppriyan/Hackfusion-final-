import os
import json
import re
from dotenv import load_dotenv
from openai import AzureOpenAI
from pydantic import BaseModel
from typing import Optional

load_dotenv()

class StructuredRequest(BaseModel):
    intent: Optional[str] = "smalltalk"
    medicine_name: Optional[str] = None
    quantity: Optional[int] = None
    delta: Optional[int] = None
    customer_id: Optional[str] = "PAT001"

client = None
try:
    client = AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    )
except Exception:
    client = None

def extract_structured_request(user_input: str) -> StructuredRequest:
    if not user_input or not isinstance(user_input, str) or not client:
        return StructuredRequest(intent="smalltalk")

    system_prompt = """
You are a pharmacy intent extraction engine. 

Rules:
1. 'inventory': User asks if a drug exists or asks for a recommendation (e.g., "medicine for blood pressure").
2. 'order': User wants to buy/order a specific amount.
3. 'history': User wants to see past orders.
4. 'smalltalk': Greetings or gibberish.

If a symptom is mentioned (e.g., "blood pressure") but no drug name, put the symptom in 'medicine_name'.
Default 'quantity' to 1 if not specified.

Return ONLY JSON:
{
  "intent": "order | inventory | history | smalltalk",
  "medicine_name": string or null,
  "quantity": integer or null,
  "customer_id": "PAT001"
}
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
        raw = response.choices[0].message.content.strip()
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            return StructuredRequest(intent="smalltalk")

        parsed = json.loads(match.group(0))
        return StructuredRequest(**parsed)
    except Exception:
        return StructuredRequest(intent="smalltalk")

# agents/tools/webhook.py

import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

WEBHOOK_URL = "https://n8n.srv1403775.hstgr.cloud/webhook/pharmacy-events"
WEBHOOK_TIMEOUT = 5  # seconds


def trigger_admin_alert(event_type: str, payload: dict):
    """
    Sends structured event to n8n automation.
    NEVER crashes the agent.
    """

    if not WEBHOOK_URL:
        return {
            "status": "disabled",
            "reason": "webhook_not_configured"
        }

    if not event_type:
        return {
            "status": "failed",
            "reason": "missing_event_type"
        }

    if not isinstance(payload, dict):
        return {
            "status": "failed",
            "reason": "invalid_payload_format"
        }

    try:
        # ------------------------------
        # Standardized Event Structure
        # ------------------------------
        data = {
            "event_type": event_type,
            "source": "pharmacy_ai_agent",
            "timestamp": datetime.utcnow().isoformat(),
            "data": payload
        }

        response = requests.post(
            WEBHOOK_URL,
            json=data,
            timeout=WEBHOOK_TIMEOUT
        )

        # Accept only successful HTTP codes
        if 200 <= response.status_code < 300:
            return {
                "status": "sent",
                "code": response.status_code
            }
        else:
            return {
                "status": "failed",
                "code": response.status_code,
                "response_text": response.text
            }

    except requests.Timeout:
        return {
            "status": "failed",
            "reason": "timeout"
        }

    except requests.ConnectionError:
        return {
            "status": "failed",
            "reason": "connection_error"
        }

    except Exception as e:
        return {
            "status": "failed",
            "reason": str(e)
        }
# agents/core/memory.py

from typing import Optional

_memory_store = {}


def _normalize_customer(customer_id: Optional[str]) -> str:
    return customer_id.strip() if customer_id else "PAT001"


def save_last_medicine(customer_id: Optional[str], medicine_name: Optional[str]) -> None:
    customer_id = _normalize_customer(customer_id)

    if not medicine_name:
        return

    _memory_store[customer_id] = medicine_name.strip()


def get_last_medicine(customer_id: Optional[str]) -> Optional[str]:
    customer_id = _normalize_customer(customer_id)
    return _memory_store.get(customer_id)


def clear_memory(customer_id: Optional[str]) -> None:
    customer_id = _normalize_customer(customer_id)
    _memory_store.pop(customer_id, None)
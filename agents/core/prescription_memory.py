# agents/core/prescription_memory.py

_verified_prescriptions = {}


def _normalize(customer_id: str, medicine_name: str):
    if not customer_id or not medicine_name:
        return None
    return f"{customer_id.strip()}_{medicine_name.strip().lower()}"


# -------------------------------------------------
# MARK PRESCRIPTION VERIFIED
# -------------------------------------------------
def mark_prescription_verified(customer_id: str, medicine_name: str):
    key = _normalize(customer_id, medicine_name)
    if not key:
        return
    _verified_prescriptions[key] = True


# -------------------------------------------------
# CHECK PRESCRIPTION STATUS
# -------------------------------------------------
def is_prescription_verified(customer_id: str, medicine_name: str):
    key = _normalize(customer_id, medicine_name)
    if not key:
        return False
    return _verified_prescriptions.get(key, False)


# -------------------------------------------------
# OPTIONAL: CLEAR MEMORY (FOR TESTING)
# -------------------------------------------------
def clear_prescriptions():
    _verified_prescriptions.clear()


# -------------------------------------------------
# OPTIONAL: DEBUG VIEW
# -------------------------------------------------
def get_all_verified():
    return dict(_verified_prescriptions)
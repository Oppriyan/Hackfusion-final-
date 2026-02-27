# agents/core/prescription_rules.py

import csv
import os

RULES_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data",
    "medicine_rules.csv"
)

_cached_rules = None


# -------------------------------------------------
# LOAD RULES (CACHED)
# -------------------------------------------------
def _load_rules():
    global _cached_rules

    if _cached_rules is not None:
        return _cached_rules

    rules = {}

    try:
        with open(RULES_PATH, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                medicine = row["medicine"].strip().lower()
                rules[medicine] = row
    except Exception:
        rules = {}

    _cached_rules = rules
    return rules


# -------------------------------------------------
# CHECK PRESCRIPTION REQUIREMENT
# -------------------------------------------------
def requires_prescription(medicine_name: str) -> bool:
    if not medicine_name:
        return False

    rules = _load_rules()

    medicine_key = medicine_name.strip().lower()

    if medicine_key not in rules:
        return False

    return str(rules[medicine_key].get("prescription_required", "")).lower() == "true"
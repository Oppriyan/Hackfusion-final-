from agents.core.agent_runner import run_agent


if __name__ == "__main__":

    test_inputs = [

        # ==============================
        # 1️⃣ SMALLTALK
        # ==============================
        "Hi",
        "Hello there",

        # ==============================
        # 2️⃣ INVENTORY CHECK
        # ==============================
        "Is Ramipril available?",
        "Check availability of Paracetamol",

        # ==============================
        # 3️⃣ INVALID MEDICINE
        # ==============================
        "Is Xyzabc available?",

        # ==============================
        # 4️⃣ ORDER OTC MEDICINE
        # ==============================
        "Order 1 Paracetamol",

        # ==============================
        # 5️⃣ ORDER PRESCRIPTION MEDICINE
        # ==============================
        "Order 2 Ramipril",

        # ==============================
        # 6️⃣ INSUFFICIENT STOCK (try large quantity)
        # ==============================
        "Order 999 Ramipril",

        # ==============================
        # 7️⃣ HISTORY
        # ==============================
        "Show my previous orders",

        # ==============================
        # 8️⃣ NATURAL LANGUAGE VARIATIONS
        # ==============================
        "I need 2 Ramipril tablets",
        "Give me Paracetamol",
        "I want medicine for blood pressure",

        # ==============================
        # 9️⃣ EDGE NOISE
        # ==============================
        "asdfghjkl",
        "",

        # ==============================
        # 🔟 ENTERPRISE EXTRACTION VALIDATION
        # ==============================
        "Order 0 Paracetamol",                 # quantity sanitize → 1
        "Order Paracetamol",                   # missing quantity → default 1
        "History",                             # single-word history
        "Increase stock of Paracetamol by 5",  # update_stock intent
        "Reduce stock of Paracetamol by 3",    # negative delta handling
        "Upload prescription for Ramipril",    # upload_prescription intent
        "Order -5 Paracetamol",                # negative quantity → sanitize
        "Order 2000 Paracetamol",              # upper bound clamp
        "Random nonsense sentence here",       # fallback
    ]

    for user_input in test_inputs:
        print("\nINPUT:", user_input)

        result = run_agent(user_input)

        print("OUTPUT:", result)
        print("-" * 60)
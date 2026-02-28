# agents/tests/test_agent.py

from agents.core.agent_runner import run_agent


def test_inputs():

    tests = [
        # -------------------------
        # SMALLTALK
        # -------------------------
        "Hi",
        "Hello there",

        # -------------------------
        # INVENTORY
        # -------------------------
        "Is Ramipril available?",
        "Check availability of Paracetamol",
        "Is Xyzabc available?",

        # -------------------------
        # ORDER WITHOUT PRESCRIPTION
        # -------------------------
        "Order 1 Paracetamol",

        # -------------------------
        # ORDER REQUIRING PRESCRIPTION
        # -------------------------
        "Order 2 Ramipril",

        # -------------------------
        # UPLOAD PRESCRIPTION FLOW
        # -------------------------
        "Upload prescription for Ramipril",
        "Order 2 Ramipril",

        # -------------------------
        # NEGATIVE QUANTITY
        # -------------------------
        "Order -5 Paracetamol",

        # -------------------------
        # ZERO QUANTITY
        # -------------------------
        "Order 0 Paracetamol",

        # -------------------------
        # EXCESSIVE QUANTITY
        # -------------------------
        "Order 2000 Paracetamol",

        # -------------------------
        # ORDER WITHOUT QUANTITY
        # -------------------------
        "Order Paracetamol",

        # -------------------------
        # HISTORY
        # -------------------------
        "History",
        "Show my previous orders",

        # -------------------------
        # RANDOM INPUT
        # -------------------------
        "Random nonsense sentence here"
    ]

    for user_input in tests:
        print("\nINPUT:", user_input)
        result = run_agent(user_input)
        print("OUTPUT:", result)
        print("-" * 60)


if __name__ == "__main__":
    test_inputs()
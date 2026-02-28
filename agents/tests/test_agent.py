# agents/tests/test_agent.py

from agents.core.agent_runner import run_agent


def test_inputs():

    tests = [

        # -------------------------
        # ORDER STATUS (NEW)
        # -------------------------
        " order 1 paracetamol  ",
       
    ]

    for user_input in tests:
        print("\nINPUT:", user_input)
        result = run_agent(user_input)
        print("OUTPUT:", result)
        print("-" * 60)


if __name__ == "__main__":
    test_inputs()
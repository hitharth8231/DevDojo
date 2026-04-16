from .dify_agents import (
    ChallengeGeneratorAgent,
    TestcaseGeneratorAgent,
    EvaluationAgent
)
import json

# 🔹 Instantiate agents
challenge_agent = ChallengeGeneratorAgent()
testcase_agent = TestcaseGeneratorAgent()
evaluation_agent = EvaluationAgent()


# 🔹 Generate Question (Agent 1 + Agent 3)
async def generate_question(data: dict) -> dict:
    topic = data.get("topic")
    difficulty = data.get("difficulty")
    user_id = data.get("user_id", "system")

    problem_statement = ""
    testcases = []

    try:
        # ✅ Agent 1 → Generate problem
        result1 = await challenge_agent.trigger(
            topic=topic,
            difficulty=difficulty,
            user_id=user_id
        )

        outputs1 = result1.get("data", {}).get("outputs", {})

        # 🔥 Handle multiple possible keys (VERY IMPORTANT)
        problem_statement = (
            outputs1.get("problem_statement") or
            outputs1.get("cleaned_description") or
            outputs1.get("description") or
            ""
        )

        # Debug log (optional but useful)
        print("🧠 Agent1 Output:", outputs1)

    except Exception as e:
        print("❌ Agent 1 Error:", e)

    try:
        # ✅ Agent 3 → Generate testcases
        if problem_statement:
            result3 = await testcase_agent.trigger(
                prompt=problem_statement,
                user_id=user_id
            )

            outputs3 = result3.get("data", {}).get("outputs", {})

            testcases = outputs3.get("testcases", [])

            print("🧪 Agent3 Output:", outputs3)

    except Exception as e:
        print("❌ Agent 3 Error:", e)

    return {
        "problem_statement": problem_statement,
        "testcases": testcases
    }


# 🔹 Get Step-by-step Breakdown (Agent 2) - REMOVED: Not used in flow
# async def get_breakdown(statement: str, user_id: str) -> dict:
#     try:
#         result = await breakdown_agent.trigger(
#             statement=statement,
#             user_id=user_id
#         )
# 
#         outputs = result.get("data", {}).get("outputs", {})
# 
#         print("📘 Breakdown Output:", outputs)
# 
#         return outputs
# 
#     except Exception as e:
#         print("❌ Breakdown Error:", e)
#         return {}


# 🔹 Evaluate Code (Agent 4)
async def evaluate_code(code: str, testcases: list, challenge_description: str, user_id: str) -> dict:
    try:
        test_cases_str = json.dumps(testcases)

        # Call Agent 4 - it now handles parsing internally
        evaluation = await evaluation_agent.trigger(
            user_code=code,
            test_cases=test_cases_str,
            challenge_description=challenge_description,
            user_id=user_id
        )

        # Extract all evaluation fields
        functional_score = evaluation.get("functional_score", 0)
        quality_score = evaluation.get("quality_score", 0)
        final_score = evaluation.get("final_score", 0)
        xp_earned = int(round(final_score))
        status = evaluation.get("status", "")
        completed_steps = evaluation.get("completed_steps", [])
        missing_steps = evaluation.get("missing_steps", [])
        feedback_list = evaluation.get("feedback", [])

        print("\n" + "="*60)
        print("✅ EVALUATION RESULT")
        print("="*60)
        print(f"Functional Score: {functional_score}")
        print(f"Quality Score: {quality_score}")
        print(f"Final Score: {final_score}")
        print(f"XP Earned: {xp_earned}")
        print(f"Status: {status}")
        print(f"Completed Steps: {len(completed_steps)}")
        print(f"Missing Steps: {len(missing_steps)}")
        print(f"Feedback Items: {len(feedback_list)}")
        print("="*60 + "\n")

        # Combine feedback into a single string
        feedback_str = " | ".join(feedback_list) if isinstance(feedback_list, list) else ""

        return {
            "score": final_score,
            "xp": xp_earned,
            "feedback": feedback_str,
            "status": status,
            "completed_steps": completed_steps,
            "missing_steps": missing_steps
        }

    except Exception as e:
        print("❌ Evaluation Error:", e)
        import traceback
        traceback.print_exc()
        # Return 0 scores instead of crashing
        return {
            "score": 0.0,
            "xp": 0,
            "feedback": "",
            "status": "",
            "completed_steps": [],
            "missing_steps": []
        }
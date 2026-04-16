import json
import os
import re
import ast
import sys
from io import StringIO
from contextlib import redirect_stdout, redirect_stderr

from dotenv import load_dotenv

from .base_agent import BaseAgent

load_dotenv()

# Load Agent URLs and API Keys from .env file
DIFY_AGENT_1_API_URL = os.getenv("DIFY_AGENT_1_API_URL")
DIFY_AGENT_1_API_KEY = os.getenv("DIFY_AGENT_1_API_KEY")

DIFY_AGENT_3_API_URL = os.getenv("DIFY_AGENT_3_API_URL")
DIFY_AGENT_3_API_KEY = os.getenv("DIFY_AGENT_3_API_KEY")

DIFY_AGENT_4_API_URL = os.getenv("DIFY_AGENT_4_API_URL")
DIFY_AGENT_4_API_KEY = os.getenv("DIFY_AGENT_4_API_KEY")


class ChallengeGeneratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(DIFY_AGENT_1_API_URL, DIFY_AGENT_1_API_KEY)

    async def trigger(self, topic: str, difficulty: str, user_id: str):
        payload = {
            "inputs": self._normalize_input_keys({
                "topic": topic,
                "difficulty": difficulty,
            }),
            "response_mode": "blocking",
            "user": user_id,
        }
        return await self._safe_post(payload)


class TestcaseGeneratorAgent(BaseAgent):
    def __init__(self):
        super().__init__(DIFY_AGENT_3_API_URL, DIFY_AGENT_3_API_KEY)

    def _fallback_testcases(self, prompt: str) -> list:
        """
        Generate basic fallback testcases when Dify agent fails.
        """
        return [
            {
                "input": "",
                "expected": "Test case generation unavailable",
                "description": "Basic test case - agent unavailable"
            }
        ]

    async def trigger(self, prompt: str, user_id: str):
        payload = {
            "inputs": self._normalize_input_keys({
                "step_wise_description": prompt,
                "challenge_description": prompt,
            }),
            "response_mode": "blocking",
            "user": user_id,
        }

        try:
            result = await self._safe_post(payload)
            outputs = result.get("data", {}).get("outputs", {})

            testcases = outputs.get("testcases", [])

            # Check if testcases is valid
            if not testcases or not isinstance(testcases, list) or len(testcases) == 0:
                print("⚠️ Dify testcase generation returned empty results, using fallback")
                testcases = self._fallback_testcases(prompt)

            print("🧪 Agent3 Output:", outputs)
            return {"data": {"outputs": {"testcases": testcases}}}

        except Exception as e:
            print("❌ Agent 3 Error:", e)
            # Return fallback testcases
            return {"data": {"outputs": {"testcases": self._fallback_testcases(prompt)}}}


class EvaluationAgent(BaseAgent):
    def __init__(self):
        super().__init__(DIFY_AGENT_4_API_URL, DIFY_AGENT_4_API_KEY)

    def _looks_like_evaluation_payload(self, value):
        if not isinstance(value, dict):
            return False

        expected_keys = {
            "functional_score",
            "quality_score",
            "final_score",
            "xp",
            "completed_steps",
            "missing_steps",
            "feedback",
            "error",
            "details",
        }
        return any(key in value for key in expected_keys)

    def _has_scores(self, value):
        if not isinstance(value, dict):
            return False
        return any(key in value for key in ("functional_score", "quality_score", "final_score", "xp"))

    def _coerce_int(self, value, default=0):
        try:
            if value in (None, ""):
                return default
            return int(float(value))
        except Exception:
            return default

    def _coerce_list(self, value):
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            try:
                parsed = json.loads(stripped)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [stripped]
        return [value]

    def _normalize_description(self, challenge_description: str) -> str:
        if not challenge_description:
            return ""

        normalized = re.sub(r"[*`#>\t]", " ", challenge_description)
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized[:600]

    def _extract_agent_error(self, raw_response: dict):
        result = raw_response.get("data", {}).get("outputs", {}).get("result", {})
        if isinstance(result, dict):
            error = result.get("error")
            details = result.get("details")
            if error or details:
                message = error or "Evaluation failed"
                if details:
                    message = f"{message}: {details}"
                return message
        return None

    def _extract_json_object(self, value):
        if isinstance(value, dict):
            return value if self._looks_like_evaluation_payload(value) else None

        if not isinstance(value, str):
            return None

        cleaned = value.strip()
        if not cleaned:
            return None

        fenced_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
        if fenced_match:
            cleaned = fenced_match.group(1).strip()

        try:
            parsed = json.loads(cleaned)
            return parsed if isinstance(parsed, dict) else None
        except Exception:
            pass

        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return None

        try:
            parsed = json.loads(cleaned[start:end + 1])
            return parsed if isinstance(parsed, dict) else None
        except Exception:
            return None

    def extract_evaluation(self, raw_response: dict) -> dict:
        """
        Extract evaluation data from Dify Agent 4 response.
        """
        evaluation = {
            "functional_score": 0,
            "quality_score": 0,
            "final_score": 0,
            "xp": 0,
            "status": "",
            "completed_steps": [],
            "missing_steps": [],
            "feedback": [],
        }

        try:
            print("\n" + "=" * 70)
            print("PARSING EVALUATION RESPONSE")
            print("=" * 70)
            print("RAW RESPONSE:", json.dumps(raw_response, indent=2, default=str))

            parsed_output = None
            candidate_sources = [
                ("top-level result", raw_response.get("result")),
                ("top-level answer", raw_response.get("answer")),
                ("top-level text", raw_response.get("text")),
                ("top-level raw response", raw_response),
            ]

            data = raw_response.get("data", {})
            if isinstance(data, dict):
                outputs = data.get("outputs", {})
                if isinstance(outputs, dict):
                    candidate_sources.extend([
                        ("data.outputs", outputs),
                        ("data.outputs.result", outputs.get("result")),
                        ("data.outputs.answer", outputs.get("answer")),
                        ("data.outputs.text", outputs.get("text")),
                    ])

                candidate_sources.extend([
                    ("data", data),
                    ("data.answer", data.get("answer")),
                    ("data.text", data.get("text")),
                ])

            for source_name, candidate in candidate_sources:
                if self._looks_like_evaluation_payload(candidate):
                    parsed_output = candidate
                else:
                    parsed_output = self._extract_json_object(candidate)
                if parsed_output:
                    print(f"Found evaluation payload in {source_name}")
                    break

            if parsed_output and isinstance(parsed_output, dict):
                print("\nEXTRACTING FIELDS:")
                if self._has_scores(parsed_output):
                    evaluation["functional_score"] = self._coerce_int(parsed_output.get("functional_score", 0))
                    evaluation["quality_score"] = self._coerce_int(parsed_output.get("quality_score", 0))
                    evaluation["final_score"] = self._coerce_int(parsed_output.get("final_score", 0))
                    evaluation["xp"] = self._coerce_int(parsed_output.get("xp", 0))
                    evaluation["status"] = str(parsed_output.get("status", ""))
                    evaluation["completed_steps"] = self._coerce_list(parsed_output.get("completed_steps", []))
                    evaluation["missing_steps"] = self._coerce_list(parsed_output.get("missing_steps", []))
                    evaluation["feedback"] = self._coerce_list(parsed_output.get("feedback", []))
                else:
                    agent_error = parsed_output.get("error")
                    agent_details = parsed_output.get("details")
                    if agent_error or agent_details:
                        evaluation["status"] = "ERROR"
                        message = agent_error or "Evaluation failed"
                        if agent_details:
                            message = f"{message}: {agent_details}"
                        evaluation["feedback"] = [message]

            print("\nFINAL EVALUATION:", json.dumps(evaluation, indent=2))
            print("=" * 70 + "\n")
            return evaluation
        except Exception as e:
            print("ERROR:", e)
            return evaluation

    def _fallback_evaluation(self, user_code: str, test_cases: list, challenge_description: str) -> dict:
        """
        Basic fallback evaluation when Dify agent fails.
        Provides minimal scoring based on code syntax and basic execution.
        """
        evaluation = {
            "functional_score": 0,
            "quality_score": 0,
            "final_score": 0.0,
            "xp": 0,
            "status": "fallback_evaluation",
            "completed_steps": [],
            "missing_steps": ["Advanced evaluation unavailable"],
            "feedback": ["Basic evaluation: Code submitted successfully"]
        }

        try:
            # Check if code is syntactically valid Python
            try:
                ast.parse(user_code)
                evaluation["quality_score"] = 30  # Basic syntax check passed
                evaluation["completed_steps"].append("Code is syntactically valid")
            except SyntaxError as e:
                evaluation["feedback"].append(f"Syntax error: {str(e)}")
                evaluation["missing_steps"].append("Fix syntax errors")
                return evaluation

            # Try to execute the code safely
            if test_cases and len(test_cases) > 0:
                # Try to run with first test case if available
                test_case = test_cases[0] if isinstance(test_cases[0], dict) else {"input": "", "expected": ""}

                # Create a safe execution environment
                safe_globals = {
                    "__builtins__": {
                        "print": print,
                        "len": len,
                        "str": str,
                        "int": int,
                        "float": float,
                        "list": list,
                        "dict": dict,
                        "set": set,
                        "range": range,
                        "sum": sum,
                        "max": max,
                        "min": min,
                        "abs": abs,
                        "sorted": sorted,
                        "reversed": reversed,
                        "enumerate": enumerate,
                        "zip": zip,
                    }
                }

                try:
                    # Capture stdout
                    old_stdout = sys.stdout
                    sys.stdout = captured_output = StringIO()

                    # Execute the code
                    exec(user_code, safe_globals)

                    output = captured_output.getvalue().strip()
                    sys.stdout = old_stdout

                    evaluation["functional_score"] = 40  # Code executed without errors
                    evaluation["completed_steps"].append("Code executed successfully")

                    # Basic output check
                    if output:
                        evaluation["functional_score"] += 20  # Code produced output
                        evaluation["completed_steps"].append("Code produced output")

                except Exception as e:
                    evaluation["feedback"].append(f"Runtime error: {str(e)}")
                    evaluation["missing_steps"].append("Fix runtime errors")
                    sys.stdout = old_stdout
                    return evaluation
            else:
                # No test cases available, give basic score for valid code
                evaluation["functional_score"] = 50
                evaluation["completed_steps"].append("Code structure appears valid")

            # Calculate final score and XP
            evaluation["final_score"] = (evaluation["functional_score"] + evaluation["quality_score"]) / 2
            evaluation["xp"] = int(round(evaluation["final_score"]))  # XP should match final score

            evaluation["feedback"].append(f"Basic evaluation completed. Score: {evaluation['final_score']:.1f}%")

        except Exception as e:
            evaluation["feedback"].append(f"Evaluation failed: {str(e)}")
            evaluation["status"] = "evaluation_error"

        return evaluation

    def parse_evaluation_result(self, result: dict) -> dict:
        return self.extract_evaluation(result)

    async def trigger(self, user_code: str, test_cases: str, challenge_description: str, user_id: str):
        # Parse test cases
        try:
            test_cases_list = json.loads(test_cases) if test_cases else []
        except:
            test_cases_list = []

        normalized_inputs = self._normalize_input_keys({
            "code_input": user_code,
            "test_cases": test_cases,
            "challenge_description": challenge_description,
        })
        payload = {
            "inputs": normalized_inputs,
            "response_mode": "blocking",
            "user": user_id,
        }

        result = await self._safe_post(payload)
        evaluation = self.parse_evaluation_result(result)

        fallback_eval = None
        # Check if evaluation is essentially empty or very low (all zeros or very low scores)
        is_poor_evaluation = (
            evaluation.get("xp", 0) <= 5 and  # Very low XP
            evaluation.get("final_score", 0) <= 10.0 and  # Very low score
            len(evaluation.get("completed_steps", [])) == 0  # No completed steps
        )

        if is_poor_evaluation:
            print("⚠️ Dify evaluation returned poor results, enhancing with fallback evaluation")
            fallback_eval = self._fallback_evaluation(user_code, test_cases_list, challenge_description)

            # Combine Dify evaluation with fallback
            if fallback_eval.get("final_score", 0) > evaluation.get("final_score", 0):
                evaluation["final_score"] = fallback_eval.get("final_score", 0)
                evaluation["functional_score"] = max(evaluation.get("functional_score", 0), fallback_eval.get("functional_score", 0))
                evaluation["quality_score"] = max(evaluation.get("quality_score", 0), fallback_eval.get("quality_score", 0))
                evaluation["xp"] = int(round(evaluation["final_score"]))
            else:
                evaluation["xp"] = int(round(evaluation.get("final_score", 0)))

            # Combine completed steps
            fallback_steps = fallback_eval.get("completed_steps", [])
            if fallback_steps:
                current_steps = evaluation.get("completed_steps", [])
                for step in fallback_steps:
                    if step not in current_steps:
                        current_steps.append(step)
                evaluation["completed_steps"] = current_steps

            # Add fallback feedback if Dify feedback is poor
            if len(evaluation.get("feedback", [])) < 2:
                fallback_feedback = fallback_eval.get("feedback", [])
                current_feedback = evaluation.get("feedback", [])
                for fb in fallback_feedback:
                    if fb not in current_feedback:
                        current_feedback.append(fb)
                evaluation["feedback"] = current_feedback

        # Normalize XP to final score always
        evaluation["xp"] = int(round(evaluation.get("final_score", 0)))

        # Try retries if agent error
        if self._extract_agent_error(result):
            retry_description = self._normalize_description(challenge_description)
            if retry_description and retry_description != challenge_description:
                payload["inputs"] = self._normalize_input_keys({
                    "code_input": user_code,
                    "test_cases": test_cases,
                    "challenge_description": retry_description,
                })
                retry_result = await self._safe_post(payload)
                retry_evaluation = self.parse_evaluation_result(retry_result)
                if retry_evaluation.get("xp", 0) or retry_evaluation.get("final_score", 0):
                    return retry_evaluation

            payload["inputs"] = self._normalize_input_keys({
                "code_input": user_code,
                "test_cases": test_cases,
                "challenge_description": "",
            })
            retry_result = await self._safe_post(payload)
            retry_evaluation = self.parse_evaluation_result(retry_result)
            if retry_evaluation.get("xp", 0) or retry_evaluation.get("final_score", 0):
                return retry_evaluation

        return evaluation

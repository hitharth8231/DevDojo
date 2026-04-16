import httpx
import json
from abc import ABC, abstractmethod

class BaseAgent(ABC):
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.api_key = api_key

    def _normalize_input_keys(self, inputs: dict) -> dict:
        def snake_to_camel(s: str) -> str:
            parts = s.split("_")
            return parts[0] + ''.join(word.capitalize() for word in parts[1:]) if len(parts) > 1 else s

        def snake_to_pascal(s: str) -> str:
            return ''.join(word.capitalize() for word in s.split("_"))

        normalized = {}
        for key, value in inputs.items():
            if value is None:
                continue

            snake = key
            lower = key.lower()
            camel = snake_to_camel(snake)
            pascal = snake_to_pascal(snake)

            normalized[snake] = value
            normalized[lower] = value
            normalized[camel] = value
            normalized[pascal] = value

        return normalized

    async def _safe_post(self, payload: dict):
        """Safely performs a POST request with the correct authentication."""
        if not self.api_url or not self.api_key:
            raise ValueError("Agent URL or API Key is not configured.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(self.api_url, headers=headers, json=payload)
                print("\n--- Dify Raw Response ---")
                print(f"URL: {self.api_url}")
                print(f"Status Code: {response.status_code}")
                print(f"Response Body: {response.text}")
                print("-------------------------\n")
                response.raise_for_status()
                
                data = response.json()
                if data.get("status") == "failed":
                    raise RuntimeError(f"Agent failed with error: {data.get('error')}")
                
                return data

            except httpx.HTTPStatusError as e:
                raise RuntimeError(f"HTTP error {e.response.status_code}: {e.response.text}")
            except json.JSONDecodeError:
                raise ValueError(f"Invalid JSON response. Raw response:\n{repr(response.text)}")
            except Exception as e:
                raise RuntimeError(f"An unexpected error occurred: {e}")

    @abstractmethod
    async def trigger(self, **kwargs):
        pass
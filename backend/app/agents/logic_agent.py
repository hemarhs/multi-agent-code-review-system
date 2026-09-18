import json

from app.schemas.finding import Finding
from app.services.llm_service import LLMService


class LogicAgent:

    def __init__(self):
        self.llm = LLMService()

    def review(self, code: str):

        prompt = f"""
You are a senior software engineer.

Analyze the code below for:
- Logic bugs
- Edge cases
- Incorrect conditions
- Missing validation
- Potential runtime errors

Return ONLY valid JSON.

Format:

[
  {{
    "severity": "HIGH",
    "title": "Issue title",
    "explanation": "Issue explanation",
    "suggested_fix": "How to fix it",
    "confidence": 0.95
  }}
]

Code:
{code}
"""

        response = self.llm.generate(prompt)

        try:
            data = json.loads(response)
        except json.JSONDecodeError:
            print("Logic Agent returned invalid JSON")
            return []

        findings = []

        for item in data:
            findings.append(
                Finding(
                    agent="logic",
                    severity=item["severity"],
                    title=item["title"],
                    explanation=item["explanation"],
                    suggested_fix=item["suggested_fix"],
                    confidence=float(item["confidence"])
                )
            )

        return findings

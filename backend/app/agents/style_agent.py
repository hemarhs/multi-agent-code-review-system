import json

from app.schemas.finding import Finding
from app.services.llm_service import LLMService


class StyleAgent:

    def __init__(self):
        self.llm = LLMService()

    def review(self, code: str):

        prompt = f"""
You are a senior software engineer.

Analyze the code below for:

- Code readability
- Naming conventions
- Maintainability
- Documentation quality
- Python best practices

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
            print("Style Agent returned invalid JSON")
            return []
        findings = []

        for item in data:
            findings.append(
                Finding(
                    agent="style",
                    severity=item["severity"],
                    title=item["title"],
                    explanation=item["explanation"],
                    suggested_fix=item["suggested_fix"],
                    confidence=float(item["confidence"])
                )
            )

        return findings

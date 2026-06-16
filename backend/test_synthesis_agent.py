from app.schemas.finding import Finding
from app.agents.synthesis_agent import SynthesisAgent


findings = [

    Finding(
        agent="security",
        severity="HIGH",
        title="Hardcoded Password",
        explanation="...",
        suggested_fix="...",
        confidence=0.95
    ),

    Finding(
        agent="logic",
        severity="HIGH",
        title="Hardcoded Password",
        explanation="...",
        suggested_fix="...",
        confidence=0.90
    ),

    Finding(
        agent="style",
        severity="LOW",
        title="Variable Naming",
        explanation="...",
        suggested_fix="...",
        confidence=0.80
    )
]

agent = SynthesisAgent()

result = agent.synthesize(findings)

print(result)
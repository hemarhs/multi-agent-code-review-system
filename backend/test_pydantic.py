from app.schemas.finding import Finding

finding = Finding(
    severity="HIGH",
    title="SQL Injection",
    explanation="Unsafe query construction",
    suggested_fix="Use parameterized queries",
    confidence=0.95
)

print(finding)
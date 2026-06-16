from app.agents.security_agent import SecurityAgent

agent = SecurityAgent()

result = agent.review(
    "password = 'admin123'"
)

print(result)
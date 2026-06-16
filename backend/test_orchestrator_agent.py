from app.agents.orchestrator_agent import OrchestratorAgent

agent = OrchestratorAgent()

code = """
password = "admin123"

users = get_all_users()

for user in users:
    profile = get_profile(user.id)

age = 18

if age > 18:
    print("Allowed")
"""

agent = OrchestratorAgent()

result = agent.review(code)

for finding in result:
    print("\n----------------")
    print("Agent:", finding.agent)
    print("Severity:", finding.severity)
    print("Title:", finding.title)
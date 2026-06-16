from app.agents.performance_agent import PerformanceAgent

agent = PerformanceAgent()

result = agent.review("""
users = get_all_users()

for user in users:
    profile = get_profile(user.id)
""")

print(result)
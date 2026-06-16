from app.agents.logic_agent import LogicAgent

agent = LogicAgent()

result = agent.review("""
age = 18

if age > 18:
    print("Allowed")
""")

print(result)
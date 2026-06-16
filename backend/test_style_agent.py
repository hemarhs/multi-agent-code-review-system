from app.agents.style_agent import StyleAgent

agent = StyleAgent()

result = agent.review("""
x = 10
y = 20
z = x + y
print(z)
""")

print(result)
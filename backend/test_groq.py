from app.services.llm_service import LLMService


llm = LLMService()

response = llm.generate(
    "Say hello in one sentence."
)

print(response)
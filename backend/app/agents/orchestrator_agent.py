from app.agents.langgraph_orchestrator import graph


class OrchestratorAgent:

    def review(self, code: str):

        result = graph.invoke(
            {
                "code": code,
                "findings": []
            }
        )

        return result["findings"]
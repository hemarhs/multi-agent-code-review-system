from concurrent.futures import ThreadPoolExecutor

from app.agents.security_agent import SecurityAgent
from app.agents.performance_agent import PerformanceAgent
from app.agents.logic_agent import LogicAgent
from app.agents.style_agent import StyleAgent
from app.agents.synthesis_agent import SynthesisAgent


class OrchestratorAgent:

    def review(self, code: str):

        # The remote checks are independent. Running them concurrently avoids
        # making users wait for four sequential model requests.
        agents = [SecurityAgent(), PerformanceAgent(), LogicAgent(), StyleAgent()]
        with ThreadPoolExecutor(max_workers=len(agents)) as executor:
            results = list(executor.map(lambda agent: agent.review(code), agents))

        findings = [finding for agent_findings in results for finding in agent_findings]
        return SynthesisAgent().synthesize(findings)

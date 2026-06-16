from typing import TypedDict

from langgraph.graph import StateGraph, END

from app.agents.security_agent import SecurityAgent
from app.agents.performance_agent import PerformanceAgent
from app.agents.logic_agent import LogicAgent
from app.agents.style_agent import StyleAgent
from app.agents.synthesis_agent import SynthesisAgent


class ReviewState(TypedDict):
    code: str
    findings: list


security_agent = SecurityAgent()
performance_agent = PerformanceAgent()
logic_agent = LogicAgent()
style_agent = StyleAgent()
synthesis_agent = SynthesisAgent()


def security_node(state: ReviewState):

    findings = security_agent.review(
        state["code"]
    )

    state["findings"].extend(findings)

    return state


def performance_node(state: ReviewState):

    findings = performance_agent.review(
        state["code"]
    )

    state["findings"].extend(findings)

    return state


def logic_node(state: ReviewState):

    findings = logic_agent.review(
        state["code"]
    )

    state["findings"].extend(findings)

    return state


def style_node(state: ReviewState):

    findings = style_agent.review(
        state["code"]
    )

    state["findings"].extend(findings)

    return state


def synthesis_node(state: ReviewState):

    state["findings"] = (
        synthesis_agent.synthesize(
            state["findings"]
        )
    )

    return state


workflow = StateGraph(ReviewState)

workflow.add_node(
    "security",
    security_node
)

workflow.add_node(
    "performance",
    performance_node
)

workflow.add_node(
    "logic",
    logic_node
)

workflow.add_node(
    "style",
    style_node
)

workflow.add_node(
    "synthesis",
    synthesis_node
)

workflow.set_entry_point(
    "security"
)

workflow.add_edge(
    "security",
    "performance"
)

workflow.add_edge(
    "performance",
    "logic"
)

workflow.add_edge(
    "logic",
    "style"
)

workflow.add_edge(
    "style",
    "synthesis"
)

workflow.add_edge(
    "synthesis",
    END
)

graph = workflow.compile()
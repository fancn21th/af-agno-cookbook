"""
Workflow Agent

Demonstrates Agno's Workflow class for multi-step orchestration.
The workflow runs: Research → Analyze → Report, using separate
specialized agents for each stage.
"""

from typing import Any, Optional
from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.workflow.workflow import Workflow
from dotenv import load_dotenv

load_dotenv()

_researcher = Agent(
    name="researcher",
    model=OpenAIChat(id="gpt-4o"),
    instructions=[
        "You are a research specialist.",
        "Given a topic, gather comprehensive background information.",
        "Structure your findings with key facts, context, and relevant data points.",
        "Be thorough but concise — aim for 200-300 words.",
    ],
    markdown=True,
)

_analyst = Agent(
    name="analyst",
    model=OpenAIChat(id="gpt-4o"),
    instructions=[
        "You are an analytical expert.",
        "Given research findings, identify patterns, insights, and implications.",
        "Highlight pros/cons, risks, opportunities, and key takeaways.",
        "Structure your analysis with clear sections.",
    ],
    markdown=True,
)

_writer = Agent(
    name="writer",
    model=OpenAIChat(id="gpt-4o"),
    instructions=[
        "You are a professional report writer.",
        "Given research and analysis, produce a clear, well-structured report.",
        "Use headers, bullet points, and a summary section.",
        "Make it professional, readable, and actionable.",
    ],
    markdown=True,
)


class ResearchWorkflow(Workflow):
    """Three-stage workflow: Research → Analyze → Report."""

    description: str = "Research, analyze, and report on any topic"

    researcher: Agent = _researcher
    analyst: Agent = _analyst
    writer: Agent = _writer

    def run(self, topic: str) -> Optional[Any]:  # type: ignore
        # Stage 1: Research
        research = self.researcher.run(f"Research this topic: {topic}")
        research_content = research.content if research else "No research available."

        # Stage 2: Analysis
        analysis = self.analyst.run(
            f"Analyze these research findings:\n\n{research_content}"
        )
        analysis_content = analysis.content if analysis else "No analysis available."

        # Stage 3: Report
        report = self.writer.run(
            f"Write a report based on:\n\nRESEARCH:\n{research_content}\n\nANALYSIS:\n{analysis_content}"
        )
        return report


# Expose as a simple agent wrapper for AG-UI compatibility
# The workflow is triggered via a single agent call
agent = Agent(
    name="workflows",
    model=OpenAIChat(id="gpt-4o"),
    instructions=[
        "You orchestrate a multi-step research workflow.",
        "When the user gives you a topic to research, run a thorough investigation.",
        "First describe what you're researching, then provide comprehensive research,",
        "then analyze the findings, and finally present a structured report.",
        "Label each stage clearly: ## Research, ## Analysis, ## Report",
    ],
    markdown=True,
)

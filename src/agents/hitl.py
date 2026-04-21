"""
Human-in-the-Loop (HITL) Agent

Demonstrates external_execution=True tools — the agent proposes steps
and the frontend user must approve/reject before execution continues.
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import tool
from dotenv import load_dotenv

load_dotenv()


@tool(external_execution=True)
def generate_task_steps(steps: list[dict]):
    """
    Generate a list of steps for the user to review and approve.
    Each step has a description and status field.
    The frontend will show an approval UI — do NOT execute without approval.

    Args:
        steps: List of step objects with 'description' and 'status' keys.
               Status should be 'enabled' or 'disabled'.
    """


agent = Agent(
    name="human_in_the_loop",
    model=OpenAIChat(id="gpt-4o"),
    tools=[generate_task_steps],
    instructions=[
        "You are a planning assistant.",
        "When the user asks you to plan something, use the generate_task_steps tool.",
        "Always break plans into 5-10 clear, actionable steps.",
        "Each step should have a 'description' (string) and 'status' ('enabled').",
        "Wait for user approval before describing the execution.",
        "After the user approves steps, acknowledge which steps were selected.",
    ],
    markdown=True,
)

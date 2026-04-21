"""
Shared State Streaming Agent

Demonstrates real-time state streaming via AG-UI STATE_DELTA events.
The agent updates a list of task steps, streaming status changes to the frontend
as it processes each step. The frontend displays a live progress tracker.
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import tool
from dotenv import load_dotenv

load_dotenv()


@tool(external_execution=True)
def update_task_steps(steps: list[dict]):
    """
    Update the task steps being displayed in the frontend progress tracker.
    Call this to stream incremental step-by-step progress to the user.

    Each step should have:
        description: A short action description (e.g. "Research the topic")
        status: One of "pending" or "completed"

    Start by calling this with all steps as "pending", then call again as
    steps complete to update their status to "completed".

    Args:
        steps: List of {"description": str, "status": "pending" | "completed"} objects.
    """


agent = Agent(
    name="shared-state-streaming",
    model=OpenAIChat(id="gpt-4o"),
    tools=[update_task_steps],
    instructions=[
        "You are a task planning assistant that streams live progress to the user.",
        "When a user asks you to plan or create steps for something:",
        "1. First call update_task_steps with ALL steps set to 'pending' to show the plan.",
        "2. Then work through each step, updating its status to 'completed' via another call.",
        "3. Continue until all steps are completed.",
        "This simulates a live workflow where progress is streamed in real-time.",
        "Keep step descriptions concise and action-oriented (3-8 words each).",
        "Create 5-8 steps for any given task.",
    ],
    markdown=True,
)

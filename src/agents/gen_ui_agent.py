"""
Gen-UI Agent (A2UI)

The agent streams task progress through AG-UI STATE_SNAPSHOT events.
The frontend reads agent state via useAgent() and renders a TaskProgress component
directly in the chat message stream using CopilotChat's messageView prop.
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import tool
from dotenv import load_dotenv

load_dotenv()


@tool(external_execution=True)
def update_task_steps(steps: list[dict]):
    """
    Update the task progress visible to the user.
    The frontend subscribes to agent state and renders a progress tracker.

    Args:
        steps: List of step objects with 'description' (str) and
               'status' ('pending' | 'completed') fields.
    """


agent = Agent(
    name="gen-ui-agent",
    model=OpenAIChat(id="gpt-4o"),
    tools=[update_task_steps],
    instructions=[
        "You are a planning assistant that shows visual task progress.",
        "When the user asks you to plan something, first call update_task_steps",
        "with all steps set to 'pending'.",
        "Then describe executing each step, calling update_task_steps again",
        "to mark steps as 'completed' one by one.",
        "Use 5-10 steps. Keep step descriptions concise (under 10 words).",
    ],
    markdown=True,
)

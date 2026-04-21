"""
Shared State Agent

Demonstrates bidirectional state sync between agent and frontend:
- Agent pushes state via STATE_SNAPSHOT (read by frontend useAgent)
- Frontend pushes context via useAgentContext (read by agent as forwarded_props)

The demo scenario: an AI recipe assistant that edits a structured recipe form.
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import tool
from dotenv import load_dotenv

load_dotenv()


@tool(external_execution=True)
def update_recipe(
    title: str,
    skill_level: str,
    cooking_time: str,
    special_preferences: list[str],
    ingredients: list[dict],
    instructions: list[str],
):
    """
    Update the recipe being displayed in the frontend form.
    The frontend will re-render the form with the new values.

    Args:
        title: Recipe title.
        skill_level: One of 'Beginner', 'Intermediate', 'Advanced'.
        cooking_time: One of '5 min', '15 min', '30 min', '45 min', '60+ min'.
        special_preferences: List of dietary tags (e.g. ['Vegetarian', 'Low Carb']).
        ingredients: List of {icon, name, amount} objects.
        instructions: List of instruction strings.
    """


agent = Agent(
    name="shared-state-read",
    model=OpenAIChat(id="gpt-4o"),
    tools=[update_recipe],
    instructions=[
        "You are an AI recipe assistant.",
        "When the user asks you to create or modify a recipe, use the update_recipe tool.",
        "Always provide complete recipe data including ingredients and step-by-step instructions.",
        "Use emoji icons for ingredients (e.g. '🥕' for carrots, '🧅' for onions).",
        "skill_level must be exactly 'Beginner', 'Intermediate', or 'Advanced'.",
        "cooking_time must be exactly one of: '5 min', '15 min', '30 min', '45 min', '60+ min'.",
    ],
    markdown=True,
)

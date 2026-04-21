"""
Gen-UI Tool-Based Agent

The agent calls tools whose results are entirely handled by the frontend
via useFrontendTool — enabling streaming, rich card rendering, and
"generate as you type" UX patterns.
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import tool
from dotenv import load_dotenv

load_dotenv()


@tool(external_execution=True)
def generate_haiku(
    japanese: list[str],
    english: list[str],
    image_name: str,
    gradient: str,
):
    """
    Generate a haiku with Japanese and English lines. The frontend renders this as a card.
    The frontend defines this tool — the agent just calls it with the right parameters.

    Args:
        japanese: Exactly 3 lines of haiku in Japanese.
        english: Exactly 3 lines of haiku translated to English.
        image_name: A descriptive image filename representing the haiku theme.
        gradient: CSS gradient string for the card background (e.g. 'linear-gradient(...)').
    """


agent = Agent(
    name="gen-ui-tool-based",
    model=OpenAIChat(id="gpt-4o"),
    tools=[generate_haiku],
    instructions=[
        "You are a creative haiku poet.",
        "When asked to write a haiku, use the generate_haiku tool.",
        "Provide exactly 3 lines in Japanese (5-7-5 mora pattern) and their English translation.",
        "Choose a beautiful CSS gradient that matches the haiku's mood.",
        "For image_name, describe a fitting Japanese nature scene as a filename like 'mountain_sakura_sunset.jpg'.",
        "Do NOT add extra text after calling the tool — let the frontend handle the display.",
    ],
    markdown=False,
)

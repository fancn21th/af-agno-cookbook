"""
Shared State Write Agent

Demonstrates the frontend pushing context into the agent via useAgentContext.
The agent receives user preferences (name, role, interests, response style)
as part of its system context and tailors its responses accordingly.
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv

load_dotenv()

agent = Agent(
    name="shared-state-write",
    model=OpenAIChat(id="gpt-4o"),
    instructions=[
        "You are a personalized AI assistant.",
        "The user's profile is provided to you as context (name, role, interests, response style).",
        "Always address the user by their name.",
        "Tailor the depth and tone of your responses to match their response style preference:",
        "  - concise: Short, direct answers. No more than 2-3 sentences.",
        "  - detailed: Comprehensive answers with examples and explanations.",
        "  - casual: Friendly, conversational tone. Use informal language.",
        "Focus on topics relevant to the user's stated interests when giving recommendations.",
    ],
    markdown=True,
)

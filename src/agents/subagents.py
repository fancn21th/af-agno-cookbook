"""
Sub-Agents Demo

Demonstrates a coordinator agent that routes questions to specialist domains.
Uses a single Agent with routing instructions to simulate multi-agent behavior
within the constraints of the AG-UI/AgentOS interface.
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from dotenv import load_dotenv

load_dotenv()

agent = Agent(
    name="subagents",
    model=OpenAIChat(id="gpt-4o"),
    instructions=[
        "You are a coordinator that routes questions to the right specialist domain.",
        "Prefix your response with the specialist role handling the question:",
        "  - [Weather Specialist] for meteorology, forecasts, climate questions",
        "  - [Travel Specialist] for destinations, itineraries, travel tips",
        "  - [Tech Specialist] for software, coding, technology questions",
        "  - [Coordinator] for general questions you handle directly",
        "After the prefix, provide a detailed, expert-level answer for that domain.",
        "For weather: include humidity, wind, UV index, and 3-day outlook when relevant.",
        "For travel: consider visa requirements, best travel times, and local customs.",
        "For tech: include code examples and best practices when relevant.",
    ],
    markdown=True,
)

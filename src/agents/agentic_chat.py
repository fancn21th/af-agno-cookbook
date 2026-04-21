"""
Agentic Chat Agent

Demonstrates basic Agent + tool call + frontend tool execution.
The agent can get weather and let the frontend change the chat background.
"""

import json
from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import tool
from dotenv import load_dotenv

load_dotenv()


@tool
def get_weather(location: str) -> str:
    """
    Get current weather for a location.

    Args:
        location: The city/location name, fully spelled out.

    Returns:
        Weather data as JSON string.
    """
    import random

    conditions = random.choice(["clear", "cloudy", "rainy", "snowy", "partly cloudy"])
    temp = random.randint(0, 35)
    return json.dumps(
        {
            "city": location,
            "temperature": temp,
            "conditions": conditions,
            "humidity": random.randint(30, 90),
            "wind_speed": random.randint(5, 40),
            "feels_like": temp - random.randint(0, 5),
        }
    )


agent = Agent(
    name="agentic_chat",
    model=OpenAIChat(id="gpt-4o"),
    tools=[get_weather],
    instructions=[
        "You are a helpful assistant.",
        "When asked about weather, use the get_weather tool.",
        "When the user asks to change the background, the frontend will handle it — just confirm.",
        "Keep responses concise and friendly.",
    ],
    markdown=True,
)

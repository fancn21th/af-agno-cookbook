"""
Tool Rendering Agent

Demonstrates useRenderTool — the frontend intercepts tool results
and renders them as custom UI components (WeatherCard, time slot picker).
"""

import json
import random
from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import tool
from dotenv import load_dotenv

load_dotenv()


@tool
def get_weather(location: str) -> str:
    """
    Get current weather for a location. The frontend will render this as a WeatherCard.

    Args:
        location: The city/location name, fully spelled out.

    Returns:
        Weather data as JSON string.
    """
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


@tool
def schedule_meeting(reason: str) -> str:
    """
    Get available meeting time slots. The frontend will render a time slot picker.

    Args:
        reason: The reason for scheduling the meeting.

    Returns:
        Available time slots as JSON string.
    """
    slots = [
        {"date": "Tomorrow", "time": "9:00 AM", "duration": "30 min"},
        {"date": "Tomorrow", "time": "2:00 PM", "duration": "1 hour"},
        {"date": "Thursday", "time": "11:00 AM", "duration": "30 min"},
        {"date": "Friday", "time": "3:00 PM", "duration": "1 hour"},
    ]
    return json.dumps({"reason": reason, "slots": slots})


agent = Agent(
    name="tool-rendering",
    model=OpenAIChat(id="gpt-4o"),
    tools=[get_weather, schedule_meeting],
    instructions=[
        "You are a helpful assistant.",
        "When asked about weather, always use the get_weather tool.",
        "When scheduling meetings, use the schedule_meeting tool.",
        "The frontend will render tool results as rich UI — just call the tools.",
    ],
    markdown=True,
)

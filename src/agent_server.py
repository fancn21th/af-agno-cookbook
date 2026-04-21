"""
Agent Server for Agno AG-UI Cookbook

Uses AgentOS with the AG-UI interface to serve all Agno agents.
The Next.js CopilotKit runtime proxies requests here via AG-UI protocol.

All demo agents are registered here and exposed at /agui.
"""

import os
import dotenv
from agno.os import AgentOS
from agno.os.interfaces.agui import AGUI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from src.agents.agentic_chat import agent as agentic_chat_agent
from src.agents.tool_rendering import agent as tool_rendering_agent
from src.agents.hitl import agent as hitl_agent
from src.agents.gen_ui import agent as gen_ui_agent
from src.agents.gen_ui_agent import agent as gen_ui_a2ui_agent
from src.agents.shared_state import agent as shared_state_agent
from src.agents.shared_state_write import agent as shared_state_write_agent
from src.agents.shared_state_streaming import agent as shared_state_streaming_agent
from src.agents.subagents import agent as subagents_agent
from src.agents.knowledge_agent import agent as knowledge_agent
from src.agents.workflow_agent import agent as workflow_agent

dotenv.load_dotenv()

# Register all agents with AgentOS
all_agents = [
    agentic_chat_agent,
    tool_rendering_agent,
    hitl_agent,
    gen_ui_agent,
    gen_ui_a2ui_agent,
    shared_state_agent,
    shared_state_write_agent,
    shared_state_streaming_agent,
    subagents_agent,
    knowledge_agent,
    workflow_agent,
]

# Each agent gets its own AGUI interface with a unique prefix,
# since AGUI binds to a single agent per instance.
agent_os = AgentOS(
    agents=all_agents,
    interfaces=[
        AGUI(agent=agentic_chat_agent),
        AGUI(agent=tool_rendering_agent, prefix="/tool-rendering"),
        AGUI(agent=hitl_agent, prefix="/hitl"),
        AGUI(agent=gen_ui_agent, prefix="/gen-ui"),
        AGUI(agent=gen_ui_a2ui_agent, prefix="/gen-ui-agent"),
        AGUI(agent=shared_state_agent, prefix="/shared-state-read"),
        AGUI(agent=shared_state_write_agent, prefix="/shared-state-write"),
        AGUI(agent=shared_state_streaming_agent, prefix="/shared-state-streaming"),
        AGUI(agent=subagents_agent, prefix="/subagents"),
        AGUI(agent=knowledge_agent, prefix="/knowledge-rag"),
        AGUI(agent=workflow_agent, prefix="/workflows"),
    ],
)
app = agent_os.get_app()


class HealthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.url.path == "/health" and request.method == "GET":
            agent_names = [a.name for a in all_agents]
            return JSONResponse({"status": "ok", "agents": agent_names})
        return await call_next(request)


app.add_middleware(HealthMiddleware)


def main():
    port = int(os.getenv("PORT", "8000"))
    agent_os.serve(app="src.agent_server:app", host="0.0.0.0", port=port, reload=True)


if __name__ == "__main__":
    main()

# Agno AG-UI Cookbook

A full-stack reference project demonstrating how to build AI-powered applications using [Agno](https://github.com/agno-agi/agno), [CopilotKit](https://github.com/CopilotKit/CopilotKit), and the [AG-UI Protocol](https://github.com/ag-ui-protocol/ag-ui).

---

## What's Inside

| Demo | Description | Key Pattern |
|------|-------------|-------------|
| **Agentic Chat** | Basic chat with weather tool, dynamic background | `useFrontendTool`, `useRenderTool`, `useAgentContext` |
| **Tool Rendering** | Custom WeatherCard and MeetingSlotPicker components | `useRenderTool` with streaming + complete states |
| **Human-in-the-Loop** | User reviews and approves AI-generated task steps | `useHumanInTheLoop`, `useLangGraphInterrupt` |
| **Gen-UI Tool-Based** | Haiku generator with CopilotSidebar | `useFrontendTool` with `render` + `handler` |
| **Shared State — Read** | Recipe editor updated in real-time by the agent | `useAgent` with `OnStateChanged` |
| **Shared State — Write** | Profile preferences pushed to agent as context | `useAgentContext` |
| **Shared State — Streaming** | Live task progress via STATE_DELTA events | `useAgent` with state streaming |
| **Sub-Agents** | Multi-agent team routing questions to specialists | `agno.team.team.Team` |
| **Knowledge/RAG** | Document Q&A with hybrid vector search | `TextKnowledgeBase` + `LanceDb` |
| **Workflows** | Three-stage research workflow (research → analyze → report) | `agno.workflow.workflow.Workflow` |
| **Gen-UI Agent** | Task progress embedded inside chat via `messageView` | `useAgent` + `messageView.children` |

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 |
| AI Interface | CopilotKit `@copilotkit/react-core` (v2 hooks) |
| Protocol | AG-UI via `@ag-ui/client` HttpAgent |
| Backend | FastAPI + Uvicorn (Python 3.11+) |
| Python env | [uv](https://docs.astral.sh/uv/) |
| Agent Framework | Agno (`agno>=2.5.17`) |
| LLM | OpenAI GPT-4o |
| Vector DB | LanceDB (local, no setup required) |

---

## Quick Start

### 1. Install Node dependencies

```bash
npm install
```

### 2. Set up Python environment with uv

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create a virtual environment and install dependencies
uv venv
uv pip install -r requirements.txt
```

The virtual environment is created at `.venv/`. Activate it when running Python commands manually:

```bash
source .venv/bin/activate
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 4. Start the development server

```bash
npm run dev
```

This starts:
- **Next.js** at [http://localhost:3000](http://localhost:3000) (with Turbopack)
- **Python agent server** at [http://localhost:8000](http://localhost:8000)

### 5. Open the app

Navigate to [http://localhost:3000](http://localhost:3000) to see all demos.

---

## Project Structure

```
agno-agui-cookbook/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── page.tsx                 # Home page with demo cards
│   │   ├── layout.tsx               # Root layout (fonts, global styles)
│   │   ├── globals.css              # Design system CSS variables
│   │   ├── api/copilotkit/route.ts  # CopilotKit runtime API proxy
│   │   └── demos/                   # Demo pages (one folder per demo)
│   │       ├── agentic-chat/
│   │       ├── tool-rendering/
│   │       ├── hitl/
│   │       ├── gen-ui-tool-based/
│   │       ├── shared-state-read/
│   │       ├── shared-state-write/
│   │       ├── shared-state-streaming/
│   │       ├── subagents/
│   │       ├── knowledge-rag/
│   │       ├── workflows/
│   │       └── gen-ui-agent/
│   └── agents/                      # Python agent definitions
│       ├── agentic_chat.py
│       ├── tool_rendering.py
│       ├── hitl.py
│       ├── gen_ui.py
│       ├── gen_ui_agent.py
│       ├── shared_state.py
│       ├── shared_state_write.py
│       ├── shared_state_streaming.py
│       ├── subagents.py
│       ├── knowledge_agent.py
│       └── workflow_agent.py
│   └── agent_server.py              # FastAPI app (AgentOS entry point)
├── data/
│   └── sample_docs/                 # Markdown docs for RAG demo
│       ├── agno_overview.md
│       ├── agui_protocol.md
│       └── copilotkit_guide.md
├── package.json
├── requirements.txt
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── .env.example
```

---

## Architecture

```
Browser (React)
  │
  ├── <CopilotKit runtimeUrl="/api/copilotkit" agent="agent-name">
  │     └── CopilotKit hooks (useFrontendTool, useRenderTool, useHumanInTheLoop, useAgent...)
  │
  └── POST /api/copilotkit  (Next.js route)
        └── CopilotRuntime
              └── HttpAgent → POST http://localhost:8000/agui  (AG-UI protocol)
                                    │
                                    └── AgentOS (Agno)
                                          └── Agent / Team / Workflow
```

### Request Flow

1. User sends a message in the chat UI
2. CopilotKit sends a POST to `/api/copilotkit` with the conversation and agent name
3. The Next.js route proxies to `localhost:8000/agui` via `HttpAgent`
4. Agno's `AgentOS` receives the AG-UI request and routes to the named agent
5. The agent processes the request and streams AG-UI events back (SSE)
6. CopilotKit decodes the events and updates the React state
7. Hooks like `useRenderTool` intercept tool events and render custom UI

---

## Key Patterns

### useFrontendTool — Tool executed in the browser

```tsx
useFrontendTool({
  name: "change_background",
  parameters: z.object({ background: z.string() }),
  handler: async ({ background }) => {
    setBackground(background);
    return "Done";
  },
  // Optional: render UI while the tool call is streaming
  render: ({ args }) => <PreviewBox style={{ background: args.background }} />,
});
```

### useRenderTool — Override how a backend tool call looks

```tsx
useRenderTool({
  name: "get_weather",
  render: ({ args, result, status }) => {
    if (status !== "complete") return <Skeleton />;
    return <WeatherCard {...result} />;
  },
});
```

### useHumanInTheLoop — Agent waits for user decision

Python side:
```python
@tool(external_execution=True)
def approve_steps(steps: list[dict]):
    """Pauses execution and waits for human approval."""
```

React side:
```tsx
useHumanInTheLoop({
  name: "approve_steps",
  render: ({ args, respond, status }) => (
    <ApprovalUI
      steps={args.steps}
      onApprove={() => respond({ approved: true })}
      disabled={status !== "executing"}
    />
  ),
});
```

### useAgent — Subscribe to agent state

```tsx
const { agent } = useAgent({
  agentId: "my-agent",
  updates: [UseAgentUpdate.OnStateChanged],
});

// State is updated via AG-UI STATE_DELTA events from Python
const steps = (agent.state as any)?.steps ?? [];
```

---

## Python Agent Patterns

### Basic agent with tools

```python
from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools import tool

@tool
def my_tool(param: str) -> str:
    return f"Result: {param}"

agent = Agent(
    name="my-agent",
    model=OpenAIChat(id="gpt-4o"),
    tools=[my_tool],
    instructions=["You are a helpful assistant."],
)
```

### Serving agents via AgentOS

```python
from agno.os import AgentOS
from agno.os.interfaces.agui import AGUI

app = AgentOS(
    agents=[agent1, agent2],
    interfaces=[AGUI(agent=agent1)],
).get_app()
```

Run with:
```bash
uv run uvicorn src.agent_server:app --host 0.0.0.0 --port 8000 --reload
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | OpenAI API key |
| `AGENT_URL` | No | `http://localhost:8000` | Python agent server URL |

---

## Adding Your Own Demo

1. **Create a Python agent** in `src/agents/my_demo.py` with `agent = Agent(name="my-demo", ...)`
2. **Register it** in `src/agent_server.py` — import and add to `all_agents`
3. **Register the name** in `src/app/api/copilotkit/route.ts` — add `"my-demo"` to `agentNames`
4. **Create the page** at `src/app/demos/my-demo/page.tsx`
5. **Add a card** to the `DEMOS` array in `src/app/page.tsx`

---

## References

- [Agno Docs](https://docs.agno.com)
- [CopilotKit Docs](https://docs.copilotkit.ai)
- [AG-UI Protocol](https://github.com/ag-ui-protocol/ag-ui)

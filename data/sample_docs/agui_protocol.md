# AG-UI Protocol

AG-UI (Agent-User Interaction) is an open protocol for streaming communication between AI agents and frontend applications. It enables real-time, bidirectional interaction with structured event types.

## Why AG-UI?

Traditional AI APIs return a complete response when the model finishes. AG-UI enables:

- **Real-time streaming** of agent responses token by token
- **Tool call interception** so frontends can render rich custom UI
- **State synchronization** between agent and frontend in real-time
- **Human-in-the-loop** — agents can pause and wait for human approval
- **Multi-agent routing** — frontends can observe which agent is active

## Architecture

```
Frontend (React)  ←→  Runtime (Node.js)  ←→  Agent (Python)
     AG-UI                HTTP Proxy              AG-UI Server
```

The AG-UI protocol runs over Server-Sent Events (SSE) for the agent-to-frontend direction, and standard HTTP POST for frontend-to-agent.

## Event Types

### Core Streaming Events

| Event | Description |
|-------|-------------|
| `TEXT_MESSAGE_START` | Agent starts a new message |
| `TEXT_MESSAGE_CONTENT` | Streaming text chunk |
| `TEXT_MESSAGE_END` | Message complete |
| `TOOL_CALL_START` | Agent begins a tool call |
| `TOOL_CALL_ARGS_DELTA` | Streaming tool arguments |
| `TOOL_CALL_END` | Tool call complete |

### State Events

| Event | Description |
|-------|-------------|
| `STATE_SNAPSHOT` | Full agent state dump |
| `STATE_DELTA` | Incremental JSON-Patch state update |
| `MESSAGES_SNAPSHOT` | Full conversation history |

### Lifecycle Events

| Event | Description |
|-------|-------------|
| `RUN_STARTED` | Agent session began |
| `RUN_FINISHED` | Agent session complete |
| `RUN_ERROR` | Error in agent execution |
| `STEP_STARTED` | Sub-step began (in workflows) |
| `STEP_FINISHED` | Sub-step complete |

### Human-in-the-Loop Events

| Event | Description |
|-------|-------------|
| `TOOL_CALL_START` (external) | Frontend must handle this tool call |
| Tool result message | Frontend sends result back |

## Using AG-UI in Python (Agno)

```python
from agno.agent import Agent
from agno.app.agui.agui import AGUI
from agno.app.agui.agent_os import AgentOS

agent = Agent(name="my-agent", ...)

app = AgentOS(
    agents=[agent],
    interfaces=[AGUI(agent=agent)],
)
```

This exposes the agent at the `/agui` endpoint, accepting POST requests and streaming SSE events back.

## Using AG-UI in JavaScript

### With CopilotKit

CopilotKit wraps AG-UI with React hooks:

```tsx
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat, useRenderTool } from "@copilotkit/react-core/v2";

function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="my-agent">
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useRenderTool({
    name: "get_weather",
    render: ({ args, result, status }) => <WeatherCard {...result} />,
  });

  return <CopilotChat />;
}
```

### With @ag-ui/client directly

```typescript
import { HttpAgent } from "@ag-ui/client";

const agent = new HttpAgent({ url: "http://localhost:8000/agui" });

for await (const event of agent.runAgent({ messages: [...] })) {
  console.log(event.type, event);
}
```

## State Streaming Deep Dive

STATE_DELTA events carry JSON-Patch operations (RFC 6902):

```json
{
  "type": "STATE_DELTA",
  "delta": [
    { "op": "add", "path": "/steps/0", "value": {"description": "Research", "status": "pending"} },
    { "op": "replace", "path": "/steps/0/status", "value": "completed" }
  ]
}
```

CopilotKit's `useAgent` hook applies these patches automatically and exposes the current state.

## Tool Rendering

When an agent calls a tool, CopilotKit intercepts the call and lets you render custom UI:

```tsx
useRenderTool({
  name: "show_chart",
  render: ({ args, result, status }) => {
    if (status !== "complete") return <LoadingSpinner />;
    return <LineChart data={result.data} />;
  },
});
```

The `render` function is called twice:
1. During streaming (with partial `args`, `status = "streaming"`)
2. After completion (with full `result`, `status = "complete"`)

## Human-in-the-Loop (HITL)

The `useHumanInTheLoop` hook intercepts `external_execution=True` tool calls:

```tsx
useHumanInTheLoop({
  name: "approve_purchase",
  render: ({ args, respond, status }) => (
    <ApprovalCard
      amount={args.amount}
      onApprove={() => respond({ approved: true })}
      onReject={() => respond({ approved: false })}
      disabled={status !== "executing"}
    />
  ),
});
```

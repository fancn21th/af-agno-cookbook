# CopilotKit Integration Guide

CopilotKit is an open-source framework for building AI-powered copilots and chat interfaces. It connects frontend React applications to AI agents using the AG-UI protocol.

## Core Concepts

### Three-Layer Architecture

```
React Frontend  →  CopilotKit Runtime  →  AI Agent
(hooks + UI)       (Node.js proxy)        (Python/LangGraph)
```

1. **Frontend Layer**: React hooks and UI components
2. **Runtime Layer**: Node.js server that proxies to AI agents
3. **Agent Layer**: Python (Agno, LangGraph, CrewAI) or built-in agents

### CopilotKit Provider

Every app must be wrapped in `<CopilotKit>`:

```tsx
import { CopilotKit } from "@copilotkit/react-core";

export default function Layout({ children }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="my-agent">
      {children}
    </CopilotKit>
  );
}
```

## Hooks Reference (v2)

All hooks are imported from `@copilotkit/react-core/v2`.

### useAgentContext

Sends frontend state to the agent as context:

```tsx
useAgentContext({
  description: "The current user's name",
  value: "Alice",
});
```

The agent receives this in its system prompt.

### useFrontendTool

Registers a tool that runs in the browser, not the backend:

```tsx
useFrontendTool({
  name: "open_modal",
  description: "Opens a modal dialog with the given content",
  parameters: z.object({ title: z.string(), content: z.string() }),
  handler: async ({ title, content }) => {
    setModalData({ title, content, open: true });
    return "Modal opened successfully";
  },
});
```

The agent calls `open_modal(...)`, it runs in the browser, and returns a result string back to the agent.

### useRenderTool

Intercepts a backend tool call and renders custom UI:

```tsx
useRenderTool({
  name: "display_chart",
  render: ({ args, result, status }) => {
    if (status === "streaming") return <SkeletonChart />;
    return <BarChart data={result.data} labels={result.labels} />;
  },
});
```

### useHumanInTheLoop

Handles `external_execution=True` Python tools:

```tsx
useHumanInTheLoop({
  name: "confirm_action",
  render: ({ args, respond, status }) => (
    <ConfirmDialog
      message={args.message}
      onConfirm={() => respond({ confirmed: true })}
      onCancel={() => respond({ confirmed: false })}
      disabled={status !== "executing"}
    />
  ),
});
```

### useAgent

Subscribes to agent state and run status:

```tsx
const { agent } = useAgent({
  agentId: "my-agent",
  updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
});

const state = agent.state;      // Current agent state
const isRunning = agent.isRunning; // Whether the agent is processing
```

### useConfigureSuggestions

Sets the suggested prompts shown in the chat input:

```tsx
useConfigureSuggestions({
  suggestions: [
    { title: "Summarize", message: "Please summarize the above content." },
    { title: "Translate", message: "Translate this to Spanish." },
  ],
  available: "always",
});
```

## UI Components

### CopilotChat

A full-featured chat interface:

```tsx
<CopilotChat
  agentId="my-agent"
  labels={{ title: "Assistant", placeholder: "Ask me anything..." }}
  className="h-full"
/>
```

### CopilotSidebar

A collapsible sidebar chat panel:

```tsx
<CopilotSidebar
  defaultOpen={true}
  labels={{ modalHeaderTitle: "AI Assistant" }}
/>
```

The sidebar overlays the main content — use it when you want the UI + chat side-by-side.

## Runtime Setup (Next.js)

```typescript
// app/api/copilotkit/route.ts
import { CopilotRuntime, ExperimentalEmptyAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

function getRuntime() {
  const agents = [
    new HttpAgent({ url: `${AGENT_URL}/agui`, name: "my-agent" }),
  ];

  return new CopilotRuntime({ remoteEndpoints: agents });
}

export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: getRuntime(),
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: req.nextUrl.pathname,
  });
  return handleRequest(req);
}
```

## Best Practices

### Performance

- Initialize `CopilotKit` once at the layout level, not inside route components
- Use `useAgent` sparingly — only subscribe to the events you need
- Prefer `useFrontendTool` over `useRenderTool` when you don't need the backend result

### State Management

- Use `useAgentContext` to push user/app state into the agent
- Use `useAgent` with `OnStateChanged` to pull agent state into the UI
- For bidirectional sync, use both hooks together

### Error Handling

- Always check `status` in `useRenderTool.render` before accessing `result`
- Handle the `"error"` status in `useHumanInTheLoop.render`
- Provide fallback UI when `agent.state` is undefined

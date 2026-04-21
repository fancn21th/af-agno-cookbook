import { NextRequest, NextResponse } from "next/server";
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { AbstractAgent, HttpAgent } from "@ag-ui/client";

// Python agent server runs on port 8000
const AGENT_URL = process.env.AGENT_URL || "http://localhost:8000";

// Map each agent name to its dedicated AGUI prefix on the Python server
const agentPrefixMap: Record<string, string> = {
  agentic_chat: "/agui",
  "tool-rendering": "/tool-rendering/agui",
  human_in_the_loop: "/hitl/agui",
  "gen-ui-tool-based": "/gen-ui/agui",
  "gen-ui-agent": "/gen-ui-agent/agui",
  "shared-state-read": "/shared-state-read/agui",
  "shared-state-write": "/shared-state-write/agui",
  "shared-state-streaming": "/shared-state-streaming/agui",
  subagents: "/subagents/agui",
  "knowledge-rag": "/knowledge-rag/agui",
  workflows: "/workflows/agui",
};

const agents: Record<string, AbstractAgent> = {};
for (const [name, path] of Object.entries(agentPrefixMap)) {
  agents[name] = new HttpAgent({ url: `${AGENT_URL}${path}` });
}
agents["default"] = new HttpAgent({ url: `${AGENT_URL}/agui` });

export const POST = async (req: NextRequest) => {
  try {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      endpoint: "/api/copilotkit",
      serviceAdapter: new ExperimentalEmptyAdapter(),
      runtime: new CopilotRuntime({
        // @ts-ignore
        agents,
      }),
    });
    return await handleRequest(req);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[copilotkit/route] ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

export const GET = async () => {
  let agentStatus = "unknown";
  try {
    const res = await fetch(`${AGENT_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    agentStatus = res.ok ? "reachable" : `error (${res.status})`;
  } catch (e: unknown) {
    agentStatus = `unreachable (${(e as Error).message})`;
  }

  return NextResponse.json({
    status: "ok",
    agent_url: AGENT_URL,
    agent_status: agentStatus,
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "set" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    },
  });
};

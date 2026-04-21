"use client";

import Link from "next/link";

const DEMOS = [
  {
    id: "agentic-chat",
    title: "Agentic Chat",
    description: "Basic AI chat with tool calling and frontend tool execution (change background, weather lookup)",
    category: "basic",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "tool-rendering",
    title: "Tool Rendering",
    description: "Backend tool results rendered as rich UI components — WeatherCard with live conditions",
    category: "basic",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "hitl",
    title: "Human in the Loop",
    description: "Agent proposes a plan; user approves or edits steps before execution continues",
    category: "basic",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "gen-ui-tool-based",
    title: "Gen-UI (Tool-Based)",
    description: "Frontend-defined tools with Zod schemas — agent streams structured data, frontend renders cards",
    category: "advanced",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    id: "gen-ui-agent",
    title: "Gen-UI (Agent State)",
    description: "Agent pushes task progress via STATE_SNAPSHOT; frontend renders an animated progress tracker",
    category: "advanced",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    id: "shared-state-read",
    title: "Shared State — Read",
    description: "Agent updates a structured recipe; frontend form reflects state changes in real time",
    category: "advanced",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
  {
    id: "shared-state-write",
    title: "Shared State — Write",
    description: "Frontend writes state into the agent via useAgentContext; agent reads and responds",
    category: "advanced",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  {
    id: "shared-state-streaming",
    title: "State Streaming",
    description: "Per-token state deltas streamed from agent to frontend — real-time incremental updates",
    category: "advanced",
    gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  },
  {
    id: "subagents",
    title: "Sub-Agents",
    description: "Coordinator agent delegates to specialist sub-agents; frontend shows delegation chain",
    category: "advanced",
    gradient: "linear-gradient(135deg, #fd7043 0%, #ffb74d 100%)",
  },
  {
    id: "knowledge-rag",
    title: "Knowledge / RAG",
    description: "Agno knowledge base with vector search — document-grounded Q&A with source citations",
    category: "agno",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    id: "workflows",
    title: "Workflows",
    description: "Agno Workflow class orchestrating Research → Analysis → Report with specialist agents",
    category: "agno",
    gradient: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Demos" },
  { id: "basic", label: "Basic" },
  { id: "advanced", label: "Advanced" },
  { id: "agno", label: "Agno Features" },
] as const;

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        fontFamily: "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          padding: "80px 48px 64px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "clamp(40px, 6vw, 80px)",
            fontWeight: 500,
            lineHeight: 1.1,
            color: "#222222",
            margin: "0 0 16px",
          }}
        >
          Agno AG-UI Cookbook
        </h1>
        <p
          style={{
            fontSize: "20px",
            fontWeight: 400,
            lineHeight: 1.5,
            color: "#45515e",
            margin: "0 0 48px",
            maxWidth: "600px",
          }}
        >
          Hands-on demos for building AI Agent applications with Agno framework,
          AG-UI protocol, and CopilotKit React hooks.
        </p>

        {/* Category filter tags */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <span
              key={cat.id}
              style={{
                padding: "6px 16px",
                borderRadius: "9999px",
                backgroundColor: cat.id === "all" ? "#181e25" : "rgba(0,0,0,0.05)",
                color: cat.id === "all" ? "#ffffff" : "#18181b",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {cat.label}
            </span>
          ))}
        </div>
      </div>

      {/* Demo grid */}
      <div
        style={{
          padding: "0 48px 80px",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {DEMOS.map((demo) => (
          <Link
            key={demo.id}
            href={`/demos/${demo.id}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "rgba(44, 30, 116, 0.11) 0px 4px 16px",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                backgroundColor: "#ffffff",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "rgba(44, 30, 116, 0.16) 0px 0px 20px";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "rgba(44, 30, 116, 0.11) 0px 4px 16px";
              }}
            >
              {/* Gradient header */}
              <div
                style={{
                  background: demo.gradient,
                  height: "100px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(255,255,255,0.25)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {demo.category}
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: "20px 24px 24px" }}>
                <h3
                  style={{
                    fontFamily: "'Outfit', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#18181b",
                    margin: "0 0 8px",
                  }}
                >
                  {demo.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: "#45515e",
                    margin: 0,
                  }}
                >
                  {demo.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#181e25",
          padding: "40px 48px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.5)",
            margin: 0,
          }}
        >
          Agno AG-UI Cookbook — built with{" "}
          <a
            href="https://github.com/agno-agi/agno"
            style={{ color: "rgba(255,255,255,0.8)" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Agno
          </a>{" "}
          and{" "}
          <a
            href="https://docs.copilotkit.ai"
            style={{ color: "rgba(255,255,255,0.8)" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            CopilotKit
          </a>
        </p>
      </div>
    </main>
  );
}

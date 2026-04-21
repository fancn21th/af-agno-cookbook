"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useAgent,
  UseAgentUpdate,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

interface TaskStep {
  description: string;
  status: "pending" | "completed";
}

interface AgentState {
  steps: TaskStep[];
}

export default function SharedStateStreamingDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="shared-state-streaming">
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  const { agent } = useAgent({
    agentId: "shared-state-streaming",
    updates: [UseAgentUpdate.OnStateChanged],
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Build a website", message: "Show me a streaming plan to build a portfolio website." },
      { title: "Learn Python", message: "Create a streaming step-by-step plan to learn Python." },
      { title: "Plan a vacation", message: "Give me a streaming plan to organize a vacation to Italy." },
    ],
    available: "always",
  });

  const agentState = agent.state as AgentState | undefined;
  const steps = agentState?.steps ?? [];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left: streaming progress panel */}
      <div
        style={{
          width: "380px",
          flexShrink: 0,
          borderRight: "1px solid #e5e7eb",
          padding: "32px 24px",
          overflowY: "auto",
          backgroundColor: "#fafafa",
        }}
      >
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "20px",
            fontWeight: 600,
            color: "#18181b",
            margin: "0 0 8px",
          }}
        >
          Live Progress
        </h2>
        <p style={{ fontSize: "13px", color: "#8e8e93", margin: "0 0 24px", lineHeight: 1.5 }}>
          State updates stream from the agent in real-time via AG-UI STATE_DELTA events.
        </p>

        {steps.length === 0 ? (
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              backgroundColor: "#f0f0f0",
              textAlign: "center",
              color: "#8e8e93",
              fontSize: "14px",
            }}
          >
            Ask the agent to plan something to see live streaming state updates.
          </div>
        ) : (
          <StreamingProgress steps={steps} />
        )}
      </div>

      {/* Right: chat */}
      <div style={{ flex: 1 }}>
        <CopilotChat
          agentId="shared-state-streaming"
          labels={{ title: "State Streaming", placeholder: "Ask for a plan..." }}
          className="h-full"
        />
      </div>
    </div>
  );
}

function StreamingProgress({ steps }: { steps: TaskStep[] }) {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPct = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#45515e" }}>Progress</span>
          <span style={{ fontSize: "13px", color: "#8e8e93" }}>
            {completedCount}/{steps.length}
          </span>
        </div>
        <div style={{ height: "6px", borderRadius: "9999px", backgroundColor: "#e5e7eb", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              borderRadius: "9999px",
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {steps.map((step, i) => {
          const isDone = step.status === "completed";
          const isCurrent =
            !isDone && i === steps.findIndex((s) => s.status === "pending");

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid",
                borderColor: isDone ? "#bbf7d0" : isCurrent ? "#bfdbfe" : "#e5e7eb",
                backgroundColor: isDone ? "#f0fdf4" : isCurrent ? "#eff6ff" : "#fff",
                transition: "all 0.3s ease",
              }}
            >
              {/* Status icon */}
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDone ? "#16a34a" : isCurrent ? "#2563eb" : "#e5e7eb",
                  fontSize: "11px",
                }}
              >
                {isDone ? (
                  <span style={{ color: "#fff" }}>✓</span>
                ) : isCurrent ? (
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                ) : (
                  <span style={{ color: "#8e8e93", fontSize: "10px" }}>{i + 1}</span>
                )}
              </div>

              <span
                style={{
                  fontSize: "13px",
                  color: isDone ? "#15803d" : isCurrent ? "#1d4ed8" : "#8e8e93",
                  fontWeight: isCurrent ? 600 : 400,
                  flex: 1,
                }}
              >
                {step.description}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

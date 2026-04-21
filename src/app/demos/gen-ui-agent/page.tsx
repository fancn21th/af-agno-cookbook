"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useAgent,
  UseAgentUpdate,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

interface AgentState {
  steps: {
    description: string;
    status: "pending" | "completed";
  }[];
}

export default function GenUiAgentDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="gen-ui-agent">
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  const { agent } = useAgent({
    agentId: "gen-ui-agent",
    updates: [UseAgentUpdate.OnStateChanged],
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Plan a trip to Japan", message: "Plan a trip to Japan in 8 steps." },
      { title: "Build a mobile app", message: "Create a step-by-step plan to build a mobile app." },
      { title: "Write a novel", message: "Give me a 6-step plan to write a novel." },
    ],
    available: "always",
  });

  const agentState = agent.state as AgentState | undefined;
  const steps = agentState?.steps;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100%" }}>
      <div style={{ height: "100%", width: "100%", maxWidth: "900px" }}>
        <CopilotChat
          agentId="gen-ui-agent"
          className="h-full"
          messageView={{
            children: ({ messageElements, interruptElement }: any) => (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {messageElements}
                {steps && steps.length > 0 && (
                  <div style={{ padding: "0 16px 16px" }}>
                    <TaskProgress steps={steps} />
                  </div>
                )}
                {interruptElement}
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}

function TaskProgress({ steps }: { steps: AgentState["steps"] }) {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPct = (completedCount / steps.length) * 100;

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#fff",
        padding: "20px 24px",
        boxShadow: "rgba(36,36,36,0.08) 0px 12px 16px -4px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "8px", right: "8px", width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))", filter: "blur(16px)" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            background: "linear-gradient(90deg, #2563eb, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Task Progress
        </h3>
        <span style={{ fontSize: "13px", color: "#8e8e93" }}>
          {completedCount}/{steps.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: "6px", borderRadius: "9999px", backgroundColor: "#e5e7eb", overflow: "hidden", marginBottom: "16px" }}>
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            borderRadius: "9999px",
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            transition: "width 0.6s ease-out",
          }}
        />
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: isDone ? "#bbf7d0" : isCurrent ? "#bfdbfe" : "#f0f0f0",
                backgroundColor: isDone ? "#f0fdf4" : isCurrent ? "#eff6ff" : "#fafafa",
                transition: "all 0.4s ease",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDone ? "#16a34a" : isCurrent ? "#2563eb" : "#d1d5db",
                  fontSize: "10px",
                }}
              >
                {isDone ? (
                  <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>
                ) : isCurrent ? (
                  <SpinnerDot />
                ) : (
                  <ClockDot />
                )}
              </div>

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isCurrent ? 600 : 400,
                  color: isDone ? "#15803d" : isCurrent ? "#1d4ed8" : "#9ca3af",
                }}
              >
                {step.description}
              </span>

              {isCurrent && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "11px",
                    color: "#2563eb",
                    fontStyle: "italic",
                  }}
                >
                  Processing...
                </span>
              )}
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

function SpinnerDot() {
  return (
    <div
      style={{
        width: "10px",
        height: "10px",
        border: "1.5px solid rgba(255,255,255,0.4)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}

function ClockDot() {
  return <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#9ca3af" }} />;
}

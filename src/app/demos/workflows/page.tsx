"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

export default function WorkflowsDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="workflows">
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Research AI trends", message: "Research the latest trends in large language models." },
      { title: "Analyze climate change", message: "Research and analyze the economic impacts of climate change." },
      { title: "Study quantum computing", message: "Research quantum computing and its implications for cryptography." },
    ],
    available: "always",
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Info sidebar */}
      <div
        style={{
          width: "260px",
          flexShrink: 0,
          borderRight: "1px solid #e5e7eb",
          padding: "32px 24px",
          backgroundColor: "#fafafa",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "18px",
            fontWeight: 600,
            color: "#18181b",
            margin: 0,
          }}
        >
          Research Workflow
        </h2>
        <p style={{ fontSize: "13px", color: "#8e8e93", margin: 0, lineHeight: 1.6 }}>
          A multi-stage Agno Workflow runs three specialist agents in sequence.
        </p>

        {[
          { step: "1", name: "Research", desc: "Gathers comprehensive background information", color: "#2563eb" },
          { step: "2", name: "Analysis", desc: "Identifies patterns, insights, and implications", color: "#7c3aed" },
          { step: "3", name: "Report", desc: "Produces a structured, professional report", color: "#059669" },
        ].map((stage) => (
          <div
            key={stage.step}
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: stage.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {stage.step}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#18181b" }}>{stage.name}</div>
              <div style={{ fontSize: "12px", color: "#8e8e93", marginTop: "2px" }}>{stage.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div style={{ flex: 1 }}>
        <CopilotChat
          agentId="workflows"
          labels={{ title: "Research Workflow", placeholder: "Enter a topic to research..." }}
          className="h-full"
        />
      </div>
    </div>
  );
}

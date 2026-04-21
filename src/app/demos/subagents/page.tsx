"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

export default function SubagentsDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="subagents">
      <DemoContent />
    </CopilotKit>
  );
}

function DemoContent() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Weather question", message: "What will the weather be like in London next week?" },
      { title: "Travel advice", message: "I want to visit Kyoto in spring — any tips?" },
      { title: "Tech question", message: "Explain the difference between REST and GraphQL." },
    ],
    available: "always",
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100%" }}>
      {/* Info panel */}
      <div
        style={{
          width: "260px",
          flexShrink: 0,
          padding: "32px 24px",
          borderRight: "1px solid #e5e7eb",
          height: "100%",
          backgroundColor: "#fafafa",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
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
          Specialist Agents
        </h2>
        <p style={{ fontSize: "13px", color: "#8e8e93", margin: 0, lineHeight: 1.6 }}>
          The coordinator delegates your question to the right specialist.
        </p>
        {[
          { name: "Coordinator", desc: "Routes to the right specialist", color: "#1456f0" },
          { name: "Weather Specialist", desc: "Meteorology & forecasts", color: "#0891b2" },
          { name: "Travel Specialist", desc: "Destinations & itineraries", color: "#059669" },
          { name: "Tech Specialist", desc: "Code & engineering", color: "#7c3aed" },
        ].map((a) => (
          <div
            key={a.name}
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: a.color }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#18181b" }}>{a.name}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#8e8e93" }}>{a.desc}</span>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, height: "100%" }}>
        <CopilotChat
          agentId="subagents"
          labels={{ title: "Multi-Agent Chat", placeholder: "Ask about weather, travel, or tech..." }}
          className="h-full"
        />
      </div>
    </div>
  );
}

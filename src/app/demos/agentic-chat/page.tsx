"use client";

import React, { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useFrontendTool,
  useRenderTool,
  useAgentContext,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

export default function AgenticChatDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="agentic_chat">
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  const [background, setBackground] = useState<string>(
    "var(--copilot-kit-background-color)",
  );

  // Pass user context to the agent
  useAgentContext({
    description: "The name of the current user",
    value: "Alex",
  });

  // Frontend-executed tool: agent calls it, browser handles it
  useFrontendTool({
    name: "change_background",
    description:
      "Change the background of the chat. Accepts any CSS background value — prefer gradients.",
    parameters: z.object({
      background: z
        .string()
        .describe("CSS background value. Prefer linear or radial gradients."),
    }),
    handler: async ({ background }: { background: string }) => {
      setBackground(background);
      return { status: "success", message: `Background updated to: ${background}` };
    },
  });

  // Render tool: intercept backend tool results and display custom UI
  useRenderTool({
    name: "get_weather",
    parameters: z.object({
      location: z.string(),
    }),
    render: ({ args, result, status }: any) => {
      if (status !== "complete") {
        return (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(59,130,246,0.1)",
              color: "#2563eb",
              fontSize: "14px",
            }}
          >
            Fetching weather for {args.location}...
          </div>
        );
      }
      return (
        <div
          style={{
            padding: "16px",
            borderRadius: "16px",
            backgroundColor: "#f0f7ff",
            border: "1px solid #bfdbfe",
            maxWidth: "320px",
          }}
        >
          <div style={{ fontWeight: 600, color: "#1d4ed8", marginBottom: "8px" }}>
            {result?.city || args.location}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "13px", color: "#45515e" }}>
            <span>Temperature: {result?.temperature}°C</span>
            <span>Feels like: {result?.feels_like}°C</span>
            <span>Humidity: {result?.humidity}%</span>
            <span>Wind: {result?.wind_speed} mph</span>
          </div>
          <div style={{ marginTop: "8px", fontSize: "13px", color: "#8e8e93", textTransform: "capitalize" }}>
            {result?.conditions}
          </div>
        </div>
      );
    },
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Check weather", message: "What's the weather in Tokyo right now?" },
      { title: "Change background", message: "Change the background to a sunset gradient." },
      { title: "Tell me a joke", message: "Tell me a short programming joke." },
    ],
    available: "always",
  });

  return (
    <div
      style={{ background, height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ height: "100%", width: "100%", maxWidth: "900px" }}>
        <CopilotChat agentId="agentic_chat" className="h-full" />
      </div>
    </div>
  );
}

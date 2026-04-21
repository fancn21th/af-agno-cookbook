"use client";

import React, { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useAgentContext,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

interface UserPreferences {
  name: string;
  role: string;
  interests: string[];
  responseStyle: "concise" | "detailed" | "casual";
}

export default function SharedStateWriteDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="shared-state-write">
      <div style={{ display: "flex", height: "100vh" }}>
        <PreferencesPanel />
        <ChatPanel />
      </div>
    </CopilotKit>
  );
}

function PreferencesPanel() {
  const [prefs, setPrefs] = useState<UserPreferences>({
    name: "Alex",
    role: "Developer",
    interests: ["AI", "Web Development"],
    responseStyle: "concise",
  });

  const INTERESTS = ["AI", "Web Development", "Data Science", "Design", "DevOps", "Mobile", "Cloud"];
  const STYLES: UserPreferences["responseStyle"][] = ["concise", "detailed", "casual"];

  // Write frontend state into the agent as context
  useAgentContext({
    description: "User preferences — name, role, interests, and preferred response style",
    value: JSON.stringify(prefs),
  });

  return (
    <div
      style={{
        width: "300px",
        flexShrink: 0,
        borderRight: "1px solid #e5e7eb",
        padding: "32px 24px",
        backgroundColor: "#fafafa",
        overflowY: "auto",
      }}
    >
      <h2
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          color: "#18181b",
          margin: "0 0 24px",
        }}
      >
        Your Profile
      </h2>
      <p style={{ fontSize: "13px", color: "#8e8e93", margin: "0 0 24px", lineHeight: 1.5 }}>
        Edit your preferences — the agent reads this context and tailors responses accordingly.
      </p>

      {/* Name */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>Name</label>
        <input
          value={prefs.name}
          onChange={(e) => setPrefs((p) => ({ ...p, name: e.target.value }))}
          style={inputStyle}
        />
      </div>

      {/* Role */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>Role</label>
        <input
          value={prefs.role}
          onChange={(e) => setPrefs((p) => ({ ...p, role: e.target.value }))}
          style={inputStyle}
        />
      </div>

      {/* Interests */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>Interests</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {INTERESTS.map((interest) => {
            const active = prefs.interests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() =>
                  setPrefs((p) => ({
                    ...p,
                    interests: active
                      ? p.interests.filter((x) => x !== interest)
                      : [...p.interests, interest],
                  }))
                }
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  backgroundColor: active ? "#1456f0" : "#e5e7eb",
                  color: active ? "#fff" : "#45515e",
                }}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Response Style */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>Response Style</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {STYLES.map((style) => (
            <button
              key={style}
              onClick={() => setPrefs((p) => ({ ...p, responseStyle: style }))}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: prefs.responseStyle === style ? "#1456f0" : "#e5e7eb",
                backgroundColor: prefs.responseStyle === style ? "#eff6ff" : "#fff",
                color: prefs.responseStyle === style ? "#1456f0" : "#45515e",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
                textTransform: "capitalize",
              }}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div
        style={{
          marginTop: "24px",
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: "#f0f7ff",
          border: "1px solid #bfdbfe",
          fontSize: "12px",
          color: "#1d4ed8",
          lineHeight: 1.5,
        }}
      >
        <strong>Agent sees:</strong>
        <br />
        {prefs.name} · {prefs.role}
        <br />
        Interests: {prefs.interests.join(", ") || "none"}
        <br />
        Style: {prefs.responseStyle}
      </div>
    </div>
  );
}

function ChatPanel() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Introduce yourself", message: "Hi! Who am I talking to?" },
      { title: "What do I like?", message: "What are my interests?" },
      { title: "Give a recommendation", message: "Recommend something based on my profile." },
    ],
    available: "always",
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <CopilotChat
        labels={{ title: "Shared State — Write", placeholder: "Chat with the agent..." }}
        className="h-full"
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  color: "#8e8e93",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "14px",
  color: "#18181b",
  backgroundColor: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

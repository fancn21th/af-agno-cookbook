"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

export default function KnowledgeRagDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="knowledge-rag">
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "What documents are available?", message: "What documents do you have in your knowledge base?" },
      { title: "Summarize key topics", message: "What are the main topics covered in your knowledge base?" },
      { title: "Search for information", message: "Find information about AI agents in your documents." },
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
          Knowledge Base
        </h2>
        <p style={{ fontSize: "13px", color: "#8e8e93", margin: 0, lineHeight: 1.6 }}>
          The agent uses Agno's built-in RAG — embedding documents and retrieving relevant chunks to ground its answers.
        </p>

        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            fontSize: "13px",
            color: "#15803d",
            lineHeight: 1.6,
          }}
        >
          <strong>Stack:</strong>
          <br />
          Embedder: OpenAI text-embedding-3-small
          <br />
          Vector DB: LanceDB (local)
          <br />
          Search: Hybrid (vector + BM25)
        </div>

        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            fontSize: "13px",
            color: "#1d4ed8",
            lineHeight: 1.6,
          }}
        >
          Documents are loaded from <code>data/sample_docs/</code>. Add your own .txt or .md files and restart the server.
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1 }}>
        <CopilotChat
          agentId="knowledge-rag"
          labels={{ title: "Document Q&A", placeholder: "Ask about the documents..." }}
          className="h-full"
        />
      </div>
    </div>
  );
}

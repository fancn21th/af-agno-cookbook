"use client";

import React, { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotSidebar,
  useFrontendTool,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

interface Haiku {
  japanese: string[];
  english: string[];
  gradient: string;
  theme: string;
}

const PLACEHOLDER: Haiku = {
  japanese: ["古池や", "蛙飛び込む", "水の音"],
  english: ["An old silent pond", "A frog jumps into the pond", "Splash! Silence again"],
  gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  theme: "nature",
};

export default function GenUiToolBasedDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="gen-ui-tool-based">
      <div style={{ display: "flex", height: "100vh" }}>
        <SidebarWithSuggestions />
        <HaikuDisplay />
      </div>
    </CopilotKit>
  );
}

function SidebarWithSuggestions() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Nature Haiku", message: "Write me a haiku about nature." },
      { title: "Ocean Haiku", message: "Create a haiku about the ocean at dawn." },
      { title: "Mountain Haiku", message: "Write a haiku about a mountain in winter." },
      { title: "City Haiku", message: "Write a haiku about a busy city at night." },
    ],
    available: "always",
  });

  return (
    <CopilotSidebar
      defaultOpen={true}
      labels={{ modalHeaderTitle: "Haiku Generator" }}
    />
  );
}

function HaikuDisplay() {
  const [haikus, setHaikus] = useState<Haiku[]>([PLACEHOLDER]);

  useFrontendTool(
    {
      name: "generate_haiku",
      description: "Generate a haiku with Japanese and English lines",
      parameters: z.object({
        japanese: z.array(z.string()).describe("3 lines of haiku in Japanese"),
        english: z.array(z.string()).describe("3 lines translated to English"),
        gradient: z.string().describe("CSS gradient for the card background"),
        theme: z.string().describe("One-word theme label for the haiku"),
      }),
      followUp: false,
      handler: async ({
        japanese,
        english,
        gradient,
        theme,
      }: {
        japanese: string[];
        english: string[];
        gradient: string;
        theme: string;
      }) => {
        const newHaiku: Haiku = { japanese, english, gradient, theme };
        setHaikus((prev) => [
          newHaiku,
          ...prev.filter((h) => h.japanese[0] !== PLACEHOLDER.japanese[0]),
        ]);
        return "Haiku generated successfully!";
      },
      render: ({ args }: { args: Partial<Haiku> }) => {
        if (!args.japanese?.length) return <></>;
        return <HaikuCard haiku={args as Haiku} preview />;
      },
    },
    [haikus],
  );

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}
    >
      <h2
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "28px",
          fontWeight: 600,
          color: "#18181b",
          margin: 0,
        }}
      >
        Haiku Gallery
      </h2>
      {haikus.map((haiku, i) => (
        <HaikuCard key={i} haiku={haiku} />
      ))}
    </div>
  );
}

function HaikuCard({ haiku, preview = false }: { haiku: Partial<Haiku>; preview?: boolean }) {
  return (
    <div
      style={{
        background: haiku.gradient || "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
        borderRadius: "20px",
        padding: "32px",
        maxWidth: "560px",
        width: "100%",
        boxShadow: "rgba(44, 30, 116, 0.16) 0px 0px 15px",
        opacity: preview ? 0.85 : 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", filter: "blur(24px)" }} />

      {haiku.theme && (
        <div
          style={{
            display: "inline-block",
            padding: "3px 12px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255,255,255,0.25)",
            fontSize: "11px",
            fontWeight: 600,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "20px",
          }}
        >
          {haiku.theme}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {haiku.japanese?.map((line, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p
              style={{
                fontFamily: "'Noto Sans JP', serif",
                fontSize: "28px",
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                textShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}
            >
              {line}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "15px",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.85)",
                margin: 0,
              }}
            >
              {haiku.english?.[i]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotChat,
  useRenderTool,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

export default function ToolRenderingDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="tool-rendering">
      <Chat />
    </CopilotKit>
  );
}

function Chat() {
  useRenderTool({
    name: "get_weather",
    parameters: z.object({ location: z.string() }),
    render: ({ args, result, status }: any) => {
      if (status !== "complete") {
        return (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "12px",
              backgroundColor: "#667eea",
              color: "#fff",
              fontSize: "14px",
            }}
          >
            <span>Retrieving weather for {args.location}...</span>
          </div>
        );
      }

      const data: WeatherData = {
        temperature: result?.temperature ?? 0,
        conditions: result?.conditions ?? "clear",
        humidity: result?.humidity ?? 0,
        windSpeed: result?.wind_speed ?? 0,
        feelsLike: result?.feels_like ?? result?.temperature ?? 0,
      };

      return (
        <WeatherCard
          location={result?.city || args.location}
          themeColor={getThemeColor(data.conditions)}
          data={data}
        />
      );
    },
  });

  useRenderTool({
    name: "schedule_meeting",
    parameters: z.object({ reason: z.string() }),
    render: ({ args, result, status }: any) => {
      if (status !== "complete") {
        return (
          <div style={{ padding: "12px", color: "#8e8e93", fontSize: "14px" }}>
            Finding available slots...
          </div>
        );
      }
      return <MeetingSlotPicker reason={args.reason} slots={result?.slots ?? []} />;
    },
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Weather in San Francisco", message: "What's the weather in San Francisco?" },
      { title: "Weather in Tokyo", message: "How's the weather in Tokyo right now?" },
      { title: "Schedule a meeting", message: "I need to schedule a meeting to discuss project updates." },
    ],
    available: "always",
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100%" }}>
      <div style={{ height: "100%", width: "100%", maxWidth: "900px" }}>
        <CopilotChat className="h-full" />
      </div>
    </div>
  );
}

/* ---- Types ---- */

interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

/* ---- Helper ---- */

function getThemeColor(conditions: string): string {
  const c = conditions.toLowerCase();
  if (c.includes("clear") || c.includes("sunny")) return "#667eea";
  if (c.includes("rain") || c.includes("storm")) return "#4a5568";
  if (c.includes("cloud")) return "#718096";
  if (c.includes("snow")) return "#63b3ed";
  return "#764ba2";
}

/* ---- WeatherCard ---- */

function WeatherCard({
  location,
  themeColor,
  data,
}: {
  location: string;
  themeColor: string;
  data: WeatherData;
}) {
  const fahrenheit = ((data.temperature * 9) / 5 + 32).toFixed(1);

  return (
    <div
      style={{
        backgroundColor: themeColor,
        borderRadius: "16px",
        overflow: "hidden",
        maxWidth: "360px",
        margin: "8px 0",
        boxShadow: "rgba(44, 30, 116, 0.16) 0px 0px 15px",
      }}
    >
      <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>{location}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>Current Weather</div>
          </div>
          <WeatherIcon conditions={data.conditions} />
        </div>

        {/* Temperature */}
        <div style={{ marginTop: "16px", display: "flex", alignItems: "flex-end", gap: "8px" }}>
          <span style={{ fontSize: "36px", fontWeight: 700, color: "#fff" }}>
            {data.temperature}°C
          </span>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
            / {fahrenheit}°F
          </span>
        </div>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", textTransform: "capitalize", marginTop: "4px" }}>
          {data.conditions}
        </div>

        {/* Stats */}
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.3)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            textAlign: "center",
          }}
        >
          {[
            { label: "Humidity", value: `${data.humidity}%` },
            { label: "Wind", value: `${data.windSpeed} mph` },
            { label: "Feels Like", value: `${data.feelsLike}°` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{label}</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeatherIcon({ conditions }: { conditions: string }) {
  const c = conditions.toLowerCase();
  if (c.includes("clear") || c.includes("sunny")) return <SunIcon />;
  if (c.includes("rain") || c.includes("storm") || c.includes("snow")) return <RainIcon />;
  return <CloudIcon />;
}

function SunIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#fde68a" }}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        strokeWidth="2" stroke="currentColor" fill="none" />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#bfdbfe" }}>
      <path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 10 0 4 4 0 0 1 0 8H7z" opacity="0.8" />
      <path d="M8 18l2 4M12 18l2 4M16 18l2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ color: "rgba(255,255,255,0.7)" }}>
      <path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 10 0 4 4 0 0 1 0 8H7z" />
    </svg>
  );
}

/* ---- MeetingSlotPicker ---- */

interface Slot {
  date: string;
  time: string;
  duration: string;
}

function MeetingSlotPicker({ reason, slots }: { reason: string; slots: Slot[] }) {
  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#fff",
        padding: "20px",
        maxWidth: "360px",
        boxShadow: "rgba(0,0,0,0.08) 0px 4px 6px",
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: 600, color: "#18181b", marginBottom: "4px" }}>
        Available Slots
      </div>
      <div style={{ fontSize: "13px", color: "#8e8e93", marginBottom: "16px" }}>
        {reason}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {slots.map((slot, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <span style={{ color: "#18181b" }}>
              {slot.date} · {slot.time}
            </span>
            <span style={{ color: "#8e8e93", fontSize: "12px" }}>{slot.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { CopilotKit, useLangGraphInterrupt } from "@copilotkit/react-core";
import {
  CopilotChat,
  useHumanInTheLoop,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

interface Step {
  description: string;
  status: "enabled" | "disabled" | "executing";
}

export default function HitlDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="human_in_the_loop">
      <DemoContent />
    </CopilotKit>
  );
}

function DemoContent() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Plan a trip", message: "Plan a 5-step trip to Japan." },
      { title: "Cook pasta", message: "Give me a 7-step plan for making homemade pasta." },
      { title: "Launch a startup", message: "Create a 10-step plan to launch a tech startup." },
    ],
    available: "always",
  });

  // Handles agent-initiated interrupts (agent pauses and asks user to pick steps)
  useLangGraphInterrupt({
    render: ({ event, resolve }) => (
      <StepSelector
        steps={event.value?.steps || []}
        onConfirm={(selected) => {
          resolve(
            "User selected these steps: " +
              selected.map((s) => s.description).join(", "),
          );
        }}
      />
    ),
  });

  // Handles the generate_task_steps tool which requires user approval
  useHumanInTheLoop({
    agentId: "human_in_the_loop",
    name: "generate_task_steps",
    description: "Generates steps for the user to review and approve",
    parameters: z.object({
      steps: z.array(
        z.object({
          description: z.string(),
          status: z.enum(["enabled", "disabled", "executing"]),
        }),
      ),
    }),
    render: ({ args, respond, status }: any) => (
      <StepsFeedback args={args} respond={respond} status={status} />
    ),
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100%" }}>
      <div style={{ height: "100%", width: "100%", maxWidth: "900px" }}>
        <CopilotChat agentId="human_in_the_loop" className="h-full" />
      </div>
    </div>
  );
}

/* ---- StepSelector (for useLangGraphInterrupt) ---- */

function StepSelector({
  steps,
  onConfirm,
}: {
  steps: Array<{ description?: string; status?: string } | string>;
  onConfirm: (steps: Step[]) => void;
}) {
  const [localSteps, setLocalSteps] = useState<Step[]>(() =>
    steps.map((s) => ({
      description: typeof s === "string" ? s : s.description || "",
      status: (typeof s === "object" && s.status === "disabled"
        ? "disabled"
        : "enabled") as Step["status"],
    })),
  );

  const enabledCount = localSteps.filter((s) => s.status === "enabled").length;

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#fff",
        padding: "24px",
        maxWidth: "480px",
        boxShadow: "rgba(0,0,0,0.08) 0px 4px 6px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#18181b" }}>
          Select Steps
        </h3>
        <span style={{ fontSize: "13px", color: "#8e8e93" }}>
          {enabledCount}/{localSteps.length} selected
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
        {localSteps.map((step, i) => (
          <label
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 10px",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: "transparent",
            }}
          >
            <input
              type="checkbox"
              checked={step.status === "enabled"}
              onChange={() =>
                setLocalSteps((prev) =>
                  prev.map((s, j) =>
                    j === i ? { ...s, status: s.status === "enabled" ? "disabled" : "enabled" } : s,
                  ),
                )
              }
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <span style={{ fontSize: "14px", color: step.status !== "enabled" ? "#8e8e93" : "#18181b", textDecoration: step.status !== "enabled" ? "line-through" : "none" }}>
              {step.description}
            </span>
          </label>
        ))}
      </div>

      <button
        onClick={() => onConfirm(localSteps.filter((s) => s.status === "enabled"))}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          backgroundColor: "#6d28d9",
          color: "#fff",
          fontWeight: 600,
          fontSize: "14px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Perform Steps ({enabledCount})
      </button>
    </div>
  );
}

/* ---- StepsFeedback (for useHumanInTheLoop) ---- */

function StepsFeedback({
  args,
  respond,
  status,
}: {
  args: any;
  respond: any;
  status: any;
}) {
  const [localSteps, setLocalSteps] = useState<Step[]>([]);
  const [decided, setDecided] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (status === "executing" && localSteps.length === 0 && args?.steps?.length > 0) {
      setLocalSteps(args.steps);
    }
  }, [status, args?.steps, localSteps.length]);

  if (!args?.steps?.length) return null;

  const steps = localSteps.length > 0 ? localSteps : args.steps;
  const enabledCount = steps.filter((s: any) => s.status === "enabled").length;
  const isActive = status === "executing";

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#fff",
        padding: "24px",
        maxWidth: "480px",
        boxShadow: "rgba(0,0,0,0.08) 0px 4px 6px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#18181b" }}>
          Review Steps
        </h3>
        <span style={{ fontSize: "13px", color: "#8e8e93" }}>
          {enabledCount}/{steps.length} selected
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
        {steps.map((step: any, i: number) => (
          <label
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", cursor: isActive ? "pointer" : "default" }}
          >
            <input
              type="checkbox"
              checked={step.status === "enabled"}
              disabled={!isActive}
              onChange={() =>
                setLocalSteps((prev) =>
                  prev.map((s, j) =>
                    j === i ? { ...s, status: s.status === "enabled" ? "disabled" : "enabled" } : s,
                  ),
                )
              }
              style={{ width: "16px", height: "16px" }}
            />
            <span style={{ fontSize: "14px", color: step.status !== "enabled" ? "#8e8e93" : "#18181b", textDecoration: step.status !== "enabled" ? "line-through" : "none" }}>
              {step.description}
            </span>
          </label>
        ))}
      </div>

      {decided === null && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            disabled={!isActive}
            onClick={() => {
              setDecided(false);
              respond?.({ accepted: false });
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              cursor: isActive ? "pointer" : "not-allowed",
              opacity: isActive ? 1 : 0.5,
              color: "#45515e",
            }}
          >
            Reject
          </button>
          <button
            disabled={!isActive}
            onClick={() => {
              setDecided(true);
              respond?.({
                accepted: true,
                steps: localSteps.filter((s) => s.status === "enabled"),
              });
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: "#16a34a",
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              border: "none",
              cursor: isActive ? "pointer" : "not-allowed",
              opacity: isActive ? 1 : 0.5,
            }}
          >
            Confirm ({enabledCount})
          </button>
        </div>
      )}

      {decided !== null && (
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: decided ? "#f0fdf4" : "#fef2f2",
            color: decided ? "#15803d" : "#dc2626",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {decided ? "Accepted" : "Rejected"}
        </div>
      )}
    </div>
  );
}

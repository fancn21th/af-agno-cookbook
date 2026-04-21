"use client";

import React, { useState, useEffect } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import {
  CopilotSidebar,
  useAgent,
  UseAgentUpdate,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

/* ---- Types ---- */

interface Ingredient {
  icon: string;
  name: string;
  amount: string;
}

interface RecipeData {
  title: string;
  skill_level: string;
  cooking_time: string;
  special_preferences: string[];
  ingredients: Ingredient[];
  instructions: string[];
}

interface RecipeAgentState {
  recipe: RecipeData;
}

const INITIAL_RECIPE: RecipeData = {
  title: "Your Recipe Here",
  skill_level: "Intermediate",
  cooking_time: "30 min",
  special_preferences: [],
  ingredients: [
    { icon: "🥕", name: "Carrots", amount: "2 large, diced" },
    { icon: "🧅", name: "Onion", amount: "1 medium, chopped" },
  ],
  instructions: ["Start by preparing all ingredients."],
};

/* ---- Page ---- */

export default function SharedStateReadDemo() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="shared-state-read">
      <div style={{ display: "flex", height: "100vh" }}>
        <RecipeEditor />
        <CopilotSidebar
          defaultOpen={true}
          labels={{ modalHeaderTitle: "AI Recipe Assistant" }}
        />
      </div>
    </CopilotKit>
  );
}

function RecipeEditor() {
  const { agent } = useAgent({
    agentId: "shared-state-read",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  useConfigureSuggestions({
    suggestions: [
      { title: "Italian pasta", message: "Create a delicious Italian pasta recipe." },
      { title: "Healthy salad", message: "Make me a healthy, colorful salad recipe." },
      { title: "Quick breakfast", message: "Give me a quick 5-minute breakfast recipe." },
    ],
    available: "always",
  });

  const agentState = agent.state as RecipeAgentState | undefined;
  const isLoading = agent.isRunning;

  const [recipe, setRecipe] = useState<RecipeData>(INITIAL_RECIPE);

  // Sync agent state into local recipe state
  useEffect(() => {
    if (agentState?.recipe) {
      setRecipe((prev) => ({ ...prev, ...agentState.recipe }));
    }
  }, [JSON.stringify(agentState?.recipe)]);

  const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
  const COOKING_TIMES = ["5 min", "15 min", "30 min", "45 min", "60+ min"];
  const PREFERENCES = ["Vegetarian", "Vegan", "Gluten-Free", "High Protein", "Low Carb", "Spicy"];

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "40px",
        backgroundColor: "#fafafa",
        position: "relative",
      }}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            padding: "6px 14px",
            borderRadius: "9999px",
            backgroundColor: "#dbeafe",
            color: "#1d4ed8",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          AI updating...
        </div>
      )}

      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Title */}
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "32px",
            fontWeight: 600,
            color: "#18181b",
            margin: "0 0 32px",
          }}
        >
          Recipe Editor
        </h1>

        {/* Recipe Title */}
        <FieldGroup label="Title">
          <input
            value={recipe.title}
            onChange={(e) => setRecipe((p) => ({ ...p, title: e.target.value }))}
            style={inputStyle}
          />
        </FieldGroup>

        {/* Skill Level */}
        <FieldGroup label="Skill Level">
          <div style={{ display: "flex", gap: "8px" }}>
            {SKILL_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setRecipe((p) => ({ ...p, skill_level: level }))}
                style={{
                  ...pillButtonStyle,
                  backgroundColor: recipe.skill_level === level ? "#181e25" : "#f0f0f0",
                  color: recipe.skill_level === level ? "#fff" : "#333",
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </FieldGroup>

        {/* Cooking Time */}
        <FieldGroup label="Cooking Time">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {COOKING_TIMES.map((t) => (
              <button
                key={t}
                onClick={() => setRecipe((p) => ({ ...p, cooking_time: t }))}
                style={{
                  ...pillButtonStyle,
                  backgroundColor: recipe.cooking_time === t ? "#181e25" : "#f0f0f0",
                  color: recipe.cooking_time === t ? "#fff" : "#333",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </FieldGroup>

        {/* Dietary Preferences */}
        <FieldGroup label="Dietary Preferences">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {PREFERENCES.map((pref) => {
              const active = recipe.special_preferences.includes(pref);
              return (
                <button
                  key={pref}
                  onClick={() =>
                    setRecipe((p) => ({
                      ...p,
                      special_preferences: active
                        ? p.special_preferences.filter((x) => x !== pref)
                        : [...p.special_preferences, pref],
                    }))
                  }
                  style={{
                    ...pillButtonStyle,
                    backgroundColor: active ? "#1456f0" : "#f0f0f0",
                    color: active ? "#fff" : "#333",
                  }}
                >
                  {pref}
                </button>
              );
            })}
          </div>
        </FieldGroup>

        {/* Ingredients */}
        <FieldGroup label="Ingredients">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", backgroundColor: "#fff", border: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "18px" }}>{ing.icon}</span>
                <span style={{ fontWeight: 500, color: "#18181b", flex: 1 }}>{ing.name}</span>
                <span style={{ fontSize: "13px", color: "#8e8e93" }}>{ing.amount}</span>
              </div>
            ))}
          </div>
        </FieldGroup>

        {/* Instructions */}
        <FieldGroup label="Instructions">
          <ol style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {recipe.instructions.map((step, i) => (
              <li key={i} style={{ fontSize: "15px", color: "#18181b", lineHeight: 1.6 }}>
                {step}
              </li>
            ))}
          </ol>
        </FieldGroup>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#45515e", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "15px",
  color: "#18181b",
  backgroundColor: "#fff",
  outline: "none",
};

const pillButtonStyle: React.CSSProperties = {
  padding: "6px 16px",
  borderRadius: "9999px",
  border: "none",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
};

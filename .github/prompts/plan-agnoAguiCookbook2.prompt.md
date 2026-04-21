# Agno AG-UI Cookbook 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `agno-agui-cookbook/` 下创建一个完整独立的学习工程，展示如何使用 Agno 框架 + AG-UI 协议 + CopilotKit 前端构建 AI Agent 应用。

**Architecture:** 
- 前端：Next.js 15 + React 19 + Tailwind CSS v4 + CopilotKit React hooks
- 后端：Python FastAPI + Uvicorn + Agno Agent Framework + AG-UI Protocol
- 通信：AG-UI 协议 (SSE event-based)，前端通过 `/api/copilotkit` 代理到 Python agent server
- 参考：CopilotKit showcase agno package 的架构模式，但完全独立、只使用 npm 发布包

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, CopilotKit (npm), AG-UI Client, Python 3.12+, Agno, FastAPI, OpenAI gpt-4o

**Design System:** MiniMax-inspired design (see `docs/design/design.md`)，核心要素：
- 白色主背景 (`#ffffff`) + 彩色产品卡片作为视觉焦点
- 多字体系统：DM Sans (UI), Outfit (Display 标题), Poppins (中层标题), Roboto (数据)
- 药丸按钮 (9999px radius) 用于导航/标签，标准圆角 (8px) 用于 CTA
- 品牌蓝 (`#1456f0` / `#3b82f6`) + 品牌粉 (`#ea5ec1` 仅装饰)
- 紫调阴影 (`rgba(44, 30, 116, 0.16)`) 用于特色卡片
- 大圆角卡片 (20px–24px) 用于产品展示
- 文字权重 500–600 为主，保持自信但友好的调性

---

## 前端流处理与 Hook 模式参考

> 本节基于 `CopilotKit/showcase/packages/agno/src/app/` 下的实际前端代码总结，供实现各 Demo 时参照。

### AG-UI 事件流的前端消费方式

前端 **不直接处理 SSE 流**。CopilotKit 已封装了 AG-UI 协议的全部流处理：
- `CopilotChat` / `CopilotSidebar` 组件自动订阅 SSE 事件流，处理 `TEXT_MESSAGE_*`、`TOOL_CALL_*`、`STATE_*` 等事件
- 开发者通过 **Hook** 声明式地介入特定事件类型，无需手动解析 SSE

### CopilotKit 核心 Hook 速查

| Hook | 用途 | 流处理方式 | 参考文件 |
|------|------|-----------|---------|
| `useRenderTool` | 后端工具结果 → 自定义 UI | 监听 `TOOL_CALL_END`，`status` 区分 loading/complete | `demos/tool-rendering/page.tsx` |
| `useFrontendTool` | 前端定义工具 (agent 调用，前端执行+渲染) | 监听 `TOOL_CALL_*`，`render` 回调流式展示 `args`，`handler` 执行逻辑 | `demos/gen-ui-tool-based/page.tsx` |
| `useHumanInTheLoop` | 人类审批/确认 | 监听 `TOOL_CALL_END` (external_execution=True)，`respond()` 发送决策回 agent | `demos/hitl/page.tsx` |
| `useLangGraphInterrupt` | Agent 中断等待输入 | 监听 AG-UI interrupt 事件，`resolve()` 恢复 agent 执行 | `demos/hitl/page.tsx` |
| `useAgent` | 读取 agent 实时状态 | 监听 `STATE_SNAPSHOT` / `STATE_DELTA`，通过 `UseAgentUpdate` 标志订阅 | `demos/shared-state-read/page.tsx`, `demos/gen-ui-agent/page.tsx` |
| `useAgentContext` | 前端状态 → agent context | 将前端数据通过 `forwarded_props` 传给 agent，非流式 | `demos/agentic-chat/page.tsx` |
| `useConfigureSuggestions` | 快速提示按钮 | 非流式，纯 UI 配置 | 所有 demo |
| `useCopilotKit` | 访问 runtime 配置 | 非流式 | `demos/shared-state-read/page.tsx` |

### 流处理模式详解

**模式 A: 文本流 (Text Streaming)**
- 由 `CopilotChat` / `CopilotSidebar` 组件自动处理
- AG-UI 事件: `TEXT_MESSAGE_START` → `TEXT_MESSAGE_CONTENT` (逐 token) → `TEXT_MESSAGE_END`
- 开发者无需编写任何流处理代码，组件内部逐 token 更新 UI

**模式 B: 工具调用流 (Tool Call Streaming)**
- AG-UI 事件: `TOOL_CALL_START` → `TOOL_CALL_ARGS` (流式参数) → `TOOL_CALL_END`
- `useRenderTool` 的 `render` 回调接收 `{ args, result, status }`：
  - `status === "executing"`: 工具正在执行，`args` 可能不完整 → 展示 loading 状态
  - `status === "complete"`: 工具执行完成，`result` 包含完整数据 → 渲染最终 UI
- `useFrontendTool` 的 `render` 回调在 LLM 流式生成 `args` 时被反复调用，实现"边生成边渲染"

**模式 C: 状态流 (State Streaming)**
- AG-UI 事件: `STATE_SNAPSHOT` (完整状态快照) / `STATE_DELTA` (增量更新)
- `useAgent({ updates: [UseAgentUpdate.OnStateChanged] })` 订阅状态变更
- `agent.state` 自动合并快照和增量，组件 re-render 时拿到最新状态
- `agent.isRunning` 可判断 agent 是否在执行中

**模式 D: 人类审批流 (HITL Interrupt)**
- `useHumanInTheLoop` 监听 `external_execution=True` 的工具调用：
  - `render({ args, respond, status })` — `status === "executing"` 时展示审批 UI
  - 用户操作后调用 `respond({ accepted: true/false, ... })` 发送决策
- `useLangGraphInterrupt` 监听 agent 主动中断：
  - `render({ event, resolve })` — 展示中断原因 + 用户输入 UI
  - 调用 `resolve(userInput)` 恢复 agent

### 每个 Demo 的组件拆分

下表列出每个 Demo 需要创建的组件，以及对应的 showcase 参考文件：

#### Agentic Chat
| 组件 | 职责 | 参考 |
|------|------|------|
| `AgenticChatDemo` (page 导出) | `<CopilotKit>` wrapper，设置 agent name | `demos/agentic-chat/page.tsx` L15-20 |
| `Chat` | 主聊天区域，注册 hooks，管理背景色状态 | `demos/agentic-chat/page.tsx` L22-97 |
| — 内联 `useFrontendTool("change_background")` | 前端工具：修改背景色 CSS gradient | 同上 L38-51 |
| — 内联 `useRenderTool("get_weather")` | 渲染天气结果 (简化版，无独立组件) | 同上 L53-71 |
| — 内联 `useConfigureSuggestions` | 快速提示按钮 | 同上 L73-86 |

**模式**: `CopilotChat` 全屏嵌入 + background 动态变化

#### Tool Rendering
| 组件 | 职责 | 参考 |
|------|------|------|
| `ToolRenderingDemo` (page 导出) | `<CopilotKit>` wrapper | `demos/tool-rendering/page.tsx` L13-18 |
| `Chat` | 注册 `useRenderTool` + suggestions | 同上 L20-87 |
| `WeatherCard` | 天气信息卡片 (温度/湿度/风速/体感) | 同上 L106-170 |
| `WeatherIcon` | 根据天气条件选择 Sun/Rain/Cloud 图标 | 同上 L172-200 |
| `SunIcon` / `RainIcon` / `CloudIcon` | SVG 天气图标组件 | 同上 L202-250 |
| `getThemeColor()` | 根据天气条件返回主题色 | 同上 L95-105 |

**模式**: `useRenderTool` + `status` 区分 loading/complete + 独立 UI 组件

#### Human-in-the-Loop (HITL)
| 组件 | 职责 | 参考 |
|------|------|------|
| `HitlDemo` (page 导出) | `<CopilotKit>` wrapper | `demos/hitl/page.tsx` L16-21 |
| `DemoContent` | 注册 `useLangGraphInterrupt` + `useHumanInTheLoop` + suggestions | 同上 L23-73 |
| `StepSelector` | 中断时的步骤选择器 (checkbox list + confirm 按钮) | 同上 L75-130 |
| `StepsFeedback` | 工具审批 UI (checkbox list + Confirm/Reject 双按钮 + 结果状态) | 同上 L132-230 |

**模式**: 双重 HITL — `useLangGraphInterrupt` (agent 中断) + `useHumanInTheLoop` (工具审批)
- `StepSelector` 用于 interrupt：用户勾选步骤后 `resolve()` 恢复 agent
- `StepsFeedback` 用于 HITL：`status === "executing"` 时可操作，`respond()` 发回决策

#### Gen-UI Tool-Based
| 组件 | 职责 | 参考 |
|------|------|------|
| `GenUiToolBasedDemo` (page 导出) | `<CopilotKit>` wrapper | `demos/gen-ui-tool-based/page.tsx` L20-25 |
| `SidebarWithSuggestions` | `CopilotSidebar` + suggestions | 同上 L27-44 |
| `HaikuDisplay` | 俳句列表 + `useFrontendTool` 注册 | 同上 L63-120 |
| `HaikuCard` | 单条俳句卡片 (日文+英文+渐变背景+图片) | 同上 L122-170 |

**模式**: `CopilotSidebar` (侧边栏) + 主内容区独立渲染
- `useFrontendTool` 同时定义 `handler` (更新状态) + `render` (流式预览)
- Zod schema 定义工具参数类型 (japanese, english, image_name, gradient)
- `followUp: false` 阻止 agent 对工具结果追加回复

#### Gen-UI Agent
| 组件 | 职责 | 参考 |
|------|------|------|
| `GenUiAgentDemo` (page 导出) | `<CopilotKit>` wrapper | `demos/gen-ui-agent/page.tsx` L16-21 |
| `Chat` | `useAgent` 读状态 + `CopilotChat` 带自定义 `messageView` | 同上 L23-65 |
| `TaskProgress` | 任务进度组件 (进度条 + 步骤列表 + 动画) | 同上 L67-140 |
| `CheckIcon` / `SpinnerIcon` / `ClockIcon` | SVG 状态图标 | 同上 |

**模式**: `useAgent` + 自定义 `messageView.children` 在消息流中插入额外 UI
- `CopilotChat` 的 `messageView.children` 接收 `{ messageElements, interruptElement }`
- 在 `messageElements` 之后插入 `TaskProgress` 组件
- agent 通过 `STATE_SNAPSHOT` 推送 `{ steps: [...] }` 状态

#### Shared State Read
| 组件 | 职责 | 参考 |
|------|------|------|
| `SharedStateReadDemo` (page 导出) | `<CopilotKit>` wrapper | `demos/shared-state-read/page.tsx` L77-90 |
| `Recipe` | 主组件：`useAgent` 读状态 + 表单 UI 双向绑定 | 同上 L92-180+ |
| — 内联表单组件 | 食谱标题/技能等级/烹饪时间/食材/步骤编辑 | 同上 (大量表单逻辑) |

**模式**: `CopilotSidebar` + 主内容区表单
- `useAgent({ updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged] })` 订阅状态+运行状态
- `agent.state` ↔ 本地 `useState` 双向同步 (agent 修改 → 本地更新，用户编辑 → `agent.setState()`)
- `agent.isRunning` 控制加载状态
- `changedKeysRef` 追踪哪些字段被 agent 修改 (可用于高亮动画)

#### Shared State Write / Streaming / Sub-Agents
- showcase 中这三个 demo 目前是 **TODO 占位** (仅 `CopilotChat` + placeholder suggestions)
- 我们的 cookbook 需要**自行实现**这些场景

---

### 前端代码参考文件索引

> 以下文件位于 `CopilotKit/showcase/packages/agno/src/app/`，实现各 Demo 时应逐一参考。

| 文件 | 内容 | 关键 Hook / 组件 | 实现状态 |
|------|------|------------------|---------|
| `layout.tsx` | 根布局，导入 CopilotKit v2 样式 | `@copilotkit/react-core/v2/styles.css` | 完整 |
| `page.tsx` | Demo 首页，链接卡片列表 | 纯 HTML/CSS | 完整 |
| `globals.css` | 全局样式 | Tailwind imports | 完整 |
| `api/copilotkit/route.ts` | API 代理路由 | `HttpAgent`, `CopilotRuntime`, `copilotRuntimeNextJSAppRouterEndpoint` | 完整 |
| `demos/agentic-chat/page.tsx` | 基础聊天 | `useFrontendTool`, `useRenderTool`, `useAgentContext`, `CopilotChat` | 完整 |
| `demos/tool-rendering/page.tsx` | 工具渲染 | `useRenderTool` + `WeatherCard` 组件 | 完整 |
| `demos/hitl/page.tsx` | 人类审批 | `useHumanInTheLoop`, `useLangGraphInterrupt` + `StepSelector`/`StepsFeedback` 组件 | 完整 |
| `demos/gen-ui-tool-based/page.tsx` | 前端工具 UI | `useFrontendTool` + Zod schema + `HaikuCard` 组件 | 完整 |
| `demos/gen-ui-agent/page.tsx` | Agent 状态 UI | `useAgent` + `messageView.children` + `TaskProgress` 组件 | 完整 |
| `demos/shared-state-read/page.tsx` | 读取 agent 状态 | `useAgent` + `UseAgentUpdate` + 表单双向绑定 | 完整 |
| `demos/shared-state-write/page.tsx` | 写入 agent 状态 | TODO 占位 — 需自行实现 | 占位 |
| `demos/shared-state-streaming/page.tsx` | 流式状态更新 | TODO 占位 — 需自行实现 | 占位 |
| `demos/subagents/page.tsx` | 子 Agent 委托 | TODO 占位 — 需自行实现 | 占位 |

---

## Phase 1: 项目脚手架 (Project Scaffolding)

### Task 1.1: 初始化项目根目录

**Files:**
- Create: `agno-agui-cookbook/package.json`
- Create: `agno-agui-cookbook/tsconfig.json`
- Create: `agno-agui-cookbook/next.config.ts`
- Create: `agno-agui-cookbook/postcss.config.mjs`
- Create: `agno-agui-cookbook/.gitignore`
- Create: `agno-agui-cookbook/.env.example`
- Create: `agno-agui-cookbook/README.md`

- [ ] **Step 1:** 创建 `package.json`，声明依赖：
  - `@ag-ui/client` ^0.0.43
  - `@copilotkit/react-core` latest stable (或 `next`)
  - `@copilotkit/runtime` latest stable (或 `next`)
  - `@copilotkit/a2ui-renderer` latest stable (或 `next`)
  - `next` ^15.0.0, `react` ^19.0.0, `react-dom` ^19.0.0
  - `recharts` ^2.15.0, `zod` ^3.24.0
  - devDependencies: `@tailwindcss/postcss` ^4.0.0, `postcss` ^8.5.0, `tailwindcss` ^4.0.0, `typescript` ^5.7.0, `@types/react` ^19.0.0, `@types/node` ^22.0.0, `concurrently` ^9.1.0
  - scripts: `dev` (concurrently 启动 next + uvicorn), `build`, `start`

- [ ] **Step 2:** 创建 `tsconfig.json` — 参考 showcase 的配置，Next.js 标准 TypeScript 配置

- [ ] **Step 3:** 创建 `next.config.ts` — 最小配置，允许 iframe 嵌入 (headers `X-Frame-Options`)

- [ ] **Step 4:** 创建 `postcss.config.mjs` — Tailwind v4 配置 (`@tailwindcss/postcss`)

- [ ] **Step 5:** 创建 `.gitignore` (node_modules, .next, __pycache__, .env, .venv)

- [ ] **Step 6:** 创建 `.env.example` 声明所需环境变量：
  ```
  OPENAI_API_KEY=your-key-here
  AGENT_URL=http://localhost:8000
  ```

- [ ] **Step 7:** 创建 `README.md` — 项目说明、安装步骤、运行方法、Demo 列表

### Task 1.2: 初始化 Python 后端

**Files:**
- Create: `agno-agui-cookbook/requirements.txt`
- Create: `agno-agui-cookbook/src/agent_server.py`

- [ ] **Step 1:** 创建 `requirements.txt`：
  ```
  agno>=2.5.17
  openai>=1.88.0
  fastapi>=0.115.13
  uvicorn[standard]>=0.34.3
  ag-ui-protocol>=0.1.8
  python-dotenv>=1.0.0
  ```

- [ ] **Step 2:** 创建 `src/agent_server.py` — 使用 Agno `AgentOS` + `AGUI` interface 暴露 agent：
  - 参考 `CopilotKit/showcase/packages/agno/src/agent_server.py` 的模式
  - 导入 agent 实例，创建 `AgentOS(agents=[agent], interfaces=[AGUI(agent=agent)])`
  - 添加 HealthMiddleware 健康检查

- [ ] **Step 3:** 创建 Python 虚拟环境并安装依赖
  ```bash
  cd agno-agui-cookbook && python -m venv .venv
  source .venv/bin/activate && pip install -r requirements.txt
  ```

### Task 1.3: 前端应用骨架

**Files:**
- Create: `agno-agui-cookbook/src/app/layout.tsx`
- Create: `agno-agui-cookbook/src/app/globals.css`
- Create: `agno-agui-cookbook/src/app/page.tsx`
- Create: `agno-agui-cookbook/src/app/api/copilotkit/route.ts`
- Create: `agno-agui-cookbook/public/.gitkeep`

- [ ] **Step 1:** 创建 `src/app/layout.tsx` — 导入 CopilotKit 样式 + globals.css，设置 HTML 结构
  - **必须** 导入 `@copilotkit/react-core/v2/styles.css` (参考 `showcase layout.tsx` L3)
  - 在 `<head>` 引入 Google Fonts: DM Sans, Outfit, Poppins, Roboto
  - 设置 body 默认字体 `font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif`
  - body 背景 `#ffffff`，文字色 `#222222`

- [ ] **Step 2:** 创建 `src/app/globals.css` — Tailwind v4 base import + Design System 自定义样式：
  - 引入字体：DM Sans, Outfit, Poppins, Roboto (Google Fonts)
  - CSS 变量：品牌色 (`--brand-blue: #1456f0`, `--brand-pink: #ea5ec1`, `--primary-500: #3b82f6`)
  - 文字色 (`--text-primary: #222222`, `--text-secondary: #45515e`, `--text-muted: #8e8e93`)
  - 阴影变量：standard, brand-glow, elevated
  - 圆角变量：pill (9999px), card-lg (20px), card-md (13px), button (8px)
  - 参考 `docs/design/design.md` Section 2–6

- [ ] **Step 3:** 创建 `src/app/page.tsx` — Demo 首页，展示所有可用 demo 的链接卡片
  - 白色背景 + 彩色渐变 Demo 卡片 (20px–24px 圆角, 紫调阴影)
  - 标题: Outfit 字体 80px weight 500 line-height 1.10
  - 副标题: DM Sans 16px weight 400 #45515e
  - 导航: 药丸形标签筛选 (9999px radius)
  - 暗色主 CTA 按钮 (#181e25, 8px radius, 白色文字)
  - 参考 `docs/design/design.md` Section 4 Component Stylings

- [ ] **Step 4:** 创建 `src/app/api/copilotkit/route.ts` — 核心 API 路由：
  - 使用 `HttpAgent` 代理到 `http://localhost:8000/agui` (参考 `showcase route.ts` L17-19)
  - 为每个 demo 注册 agent name (参考 `showcase route.ts` L22-38 的 `agentNames` 列表模式)
  - `CopilotRuntime` + `ExperimentalEmptyAdapter` + `copilotRuntimeNextJSAppRouterEndpoint` (参考 `showcase route.ts` L45-63)
  - GET 端点用于健康检查 (参考 `showcase route.ts` L77-95)

- [ ] **Step 5:** 运行 `pnpm install` 安装前端依赖

- [ ] **Step 6:** 验证 `pnpm dev` 可以同时启动前端和后端

---

## Phase 2: 基础 Agent Demo

### Task 2.1: Agentic Chat (基础对话)

**前端参考:** `showcase/demos/agentic-chat/page.tsx`

**Files:**
- Create: `agno-agui-cookbook/src/agents/agentic_chat.py`
- Create: `agno-agui-cookbook/src/app/demos/agentic-chat/page.tsx`

**需要创建的组件:**
- `AgenticChatDemo` — 页面导出组件，`<CopilotKit>` wrapper
- `Chat` — 内部组件，注册所有 hooks，渲染 `CopilotChat`

- [ ] **Step 1:** 创建 Python agent — 基础 Agno Agent：
  - `Agent(name="agentic_chat", model=OpenAIChat(id="gpt-4o"), instructions="...")`
  - 添加简单工具: `get_weather` (返回天气数据，展示工具调用)
  - 配置 `tools=[get_weather]`

- [ ] **Step 2:** 在 `agent_server.py` 中注册此 agent

- [ ] **Step 3:** 创建前端 page.tsx：
  - `AgenticChatDemo` 设置 `<CopilotKit runtimeUrl="/api/copilotkit" agent="agentic_chat">`
  - `Chat` 内注册:
    - `useAgentContext({ description: "...", value: "..." })` — 传递用户上下文给 agent
    - `useFrontendTool("change_background", { parameters: z.object({...}), handler })` — 前端执行的工具
    - `useRenderTool("get_weather", { parameters, render: ({args, result, status}) => ... })` — 工具结果渲染，注意区分 `status !== "complete"` (loading) 和 `status === "complete"` (渲染结果)
    - `useConfigureSuggestions({ suggestions: [...], available: "always" })` — 快速提示
  - 使用 `CopilotChat` 全屏嵌入，背景色通过 `useState` + CSS `style` 动态切换

- [ ] **Step 4:** 在 API route 中注册 `agentic_chat` agent 映射

- [ ] **Step 5:** 验证对话功能正常

### Task 2.2: Tool Rendering (工具渲染)

**前端参考:** `showcase/demos/tool-rendering/page.tsx`

**Files:**
- Create: `agno-agui-cookbook/src/agents/tool_rendering.py`
- Create: `agno-agui-cookbook/src/app/demos/tool-rendering/page.tsx`

**需要创建的组件:**
- `ToolRenderingDemo` — 页面导出，`<CopilotKit>` wrapper
- `Chat` — hook 注册 + `CopilotChat` 渲染
- `WeatherCard` — 天气信息卡片 (props: location, themeColor, result)
- `WeatherIcon` — 根据天气条件选择 SVG 图标的路由组件
- `SunIcon` / `RainIcon` / `CloudIcon` — 3 个 SVG 天气图标
- `getThemeColor(conditions)` — 纯函数，天气条件 → 主题色映射

- [ ] **Step 1:** 创建 Python agent — 带工具的 Agent：
  - `get_weather` 工具返回结构化 `WeatherResult` (location, temperature, humidity, wind_speed, feels_like, conditions)
  - `schedule_meeting` 工具返回可用时间段

- [ ] **Step 2:** 创建前端 page.tsx：
  - `useRenderTool("get_weather", { render: ({args, result, status}) => ... })`:
    - `status !== "complete"` → 展示 loading 动画 (参考 showcase L34-38 带 `animate-spin` 的加载状态)
    - `status === "complete"` → 从 `result` 提取天气数据，传入 `WeatherCard`
  - `WeatherCard`: 动态背景色 (由 `getThemeColor` 根据天气条件决定)，展示温度(℃/℉)、湿度、风速、体感温度
  - `useConfigureSuggestions` 配置城市天气查询快捷按钮

- [ ] **Step 3:** 验证工具调用 → 自定义 UI 渲染链路

### Task 2.3: Human-in-the-Loop (人类审批)

**前端参考:** `showcase/demos/hitl/page.tsx`

**Files:**
- Create: `agno-agui-cookbook/src/agents/hitl.py`
- Create: `agno-agui-cookbook/src/app/demos/hitl/page.tsx`

**需要创建的组件:**
- `HitlDemo` — 页面导出，`<CopilotKit>` wrapper
- `DemoContent` — hook 注册 + `CopilotChat` 渲染
- `StepSelector` — 中断步骤选择器 (props: steps[], onConfirm)
  - checkbox list，勾选/取消步骤
  - "Perform Steps (N)" 确认按钮
  - 用于 `useLangGraphInterrupt` 的 `render` 回调
- `StepsFeedback` — 工具审批 UI (props: args, respond, status)
  - checkbox list + 选中计数
  - "Confirm (N)" / "Reject" 双按钮 (仅 `status === "executing"` 时可点)
  - 决策后显示 "Accepted" / "Rejected" 状态标签
  - 用于 `useHumanInTheLoop` 的 `render` 回调

- [ ] **Step 1:** 创建 Python agent：
  - 带 `external_execution=True` 的工具 (如 `generate_task_steps`)
  - 工具执行需要前端用户确认

- [ ] **Step 2:** 创建前端 page.tsx：
  - `useLangGraphInterrupt({ render: ({ event, resolve }) => <StepSelector ... /> })` — agent 主动中断
  - `useHumanInTheLoop({ agentId, name: "generate_task_steps", parameters: z.object({steps: z.array(...)}), render: ({args, respond, status}) => <StepsFeedback .../> })` — 工具级审批
  - 关键: `respond()` 发送 `{ accepted: boolean, steps?: Step[] }` 给 agent

- [ ] **Step 3:** 验证完整审批流程: agent 提交 → 前端展示 → 用户确认 → agent 继续

---

## Phase 3: 高级 Demo

### Task 3.1: Gen-UI Tool-Based (动态 UI 生成)

**前端参考:** `showcase/demos/gen-ui-tool-based/page.tsx`

**Files:**
- Create: `agno-agui-cookbook/src/agents/gen_ui.py`
- Create: `agno-agui-cookbook/src/app/demos/gen-ui-tool-based/page.tsx`

**需要创建的组件:**
- `GenUiToolBasedDemo` — 页面导出，`<CopilotKit>` wrapper
- `SidebarWithSuggestions` — `CopilotSidebar` + suggestions (侧边栏聊天)
- `HaikuDisplay` / 或自定义数据展示区 — 主内容区 + `useFrontendTool` 注册
- `HaikuCard` / 数据卡片组件 — 单条数据的渲染卡片

- [ ] **Step 1:** 创建 Python agent：
  - 实现生成结构化数据的工具 (如 `generate_haiku`, `query_data`)
  - 返回 JSON 格式数据供前端动态渲染

- [ ] **Step 2:** 创建前端 page.tsx：
  - 使用 `CopilotSidebar` (而非全屏 CopilotChat) — 聊天在侧边栏，主区域展示生成结果
  - `useFrontendTool` 关键配置:
    - `parameters`: Zod schema 定义结构化参数 (LLM 流式填充)
    - `handler`: async 函数，更新本地 state (如 `setHaikus(prev => [newItem, ...prev])`)
    - `render`: 流式预览 — LLM 生成 args 过程中实时渲染部分卡片
    - `followUp: false` — 阻止 agent 对工具结果追加文本回复
  - 使用 `recharts` 渲染数据图表 (如果做数据查询场景)

- [ ] **Step 3:** 验证动态 UI 生成功能

### Task 3.2: Shared State (共享状态)

**前端参考:** `showcase/demos/shared-state-read/page.tsx` (完整实现), `shared-state-write/page.tsx` (占位), `shared-state-streaming/page.tsx` (占位)

**Files:**
- Create: `agno-agui-cookbook/src/agents/shared_state.py`
- Create: `agno-agui-cookbook/src/app/demos/shared-state-read/page.tsx`
- Create: `agno-agui-cookbook/src/app/demos/shared-state-write/page.tsx`
- Create: `agno-agui-cookbook/src/app/demos/shared-state-streaming/page.tsx`

**需要创建的组件 (shared-state-read):**
- `SharedStateReadDemo` — 页面导出
- `Recipe` / 主内容组件 — `useAgent` 订阅状态 + 表单 UI
  - `useAgent({ agentId, updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged] })`
  - `agent.state` ↔ 本地 `useState` 双向同步逻辑 (参考 showcase L140-180 的 JSON diff 同步)
  - `agent.isRunning` 控制 loading 状态
  - 内联表单: 标题输入、下拉选择、checkbox 组、列表编辑

**需要创建的组件 (shared-state-write):**
- `SharedStateWriteDemo` — 页面导出
- 主内容组件 — `useAgentContext` 将前端状态注入 agent
  - 前端表单/控件 → state → `useAgentContext({ description, value: stateValue })`
  - agent 读取 context 并在回复中引用

**需要创建的组件 (shared-state-streaming):**
- `SharedStateStreamingDemo` — 页面导出
- 流式状态展示组件 — `useAgent` + `STATE_DELTA` 增量更新
  - 进度条、实时数据流展示
  - `agent.state` 自动合并 delta，组件逐帧 re-render

- [ ] **Step 1:** 创建 Python agent — 支持状态管理的 Agent：
  - Agent 通过 AG-UI STATE_SNAPSHOT / STATE_DELTA 事件同步状态
  - 维护内部 state (如 recipe data, task progress)

- [ ] **Step 2:** 创建 shared-state-read page.tsx (参考 showcase 完整实现)

- [ ] **Step 3:** 创建 shared-state-write page.tsx (showcase 为占位，需自行实现)

- [ ] **Step 4:** 创建 shared-state-streaming page.tsx (showcase 为占位，需自行实现)

- [ ] **Step 5:** 验证三种共享状态模式

### Task 3.3: Sub-Agents (子 Agent 委托)

**前端参考:** `showcase/demos/subagents/page.tsx` (占位，需自行实现)

**Files:**
- Create: `agno-agui-cookbook/src/agents/subagents.py`
- Create: `agno-agui-cookbook/src/app/demos/subagents/page.tsx`

**需要创建的组件:**
- `SubagentsDemo` — 页面导出
- `DelegationView` — 展示当前执行的 agent 和委托链
- 可使用 `useAgent` + `CopilotChat` 自定义 `messageView`

- [ ] **Step 1:** 创建 Python agent — 多 Agent 协作：
  - 主 Agent 根据任务类型委托给子 Agent
  - 使用 Agno 的 Team 或 Workflow 模式

- [ ] **Step 2:** 创建前端 page.tsx：
  - 展示当前执行的 agent 和委托链
  - 使用 `useAgent()` 监听 agent 切换

- [ ] **Step 3:** 验证多 Agent 委托流程

---

## Phase 4: Agno 特色功能 Demo

### Task 4.1: Knowledge/RAG (知识检索增强)

**Files:**
- Create: `agno-agui-cookbook/src/agents/knowledge_agent.py`
- Create: `agno-agui-cookbook/src/app/demos/knowledge-rag/page.tsx`
- Create: `agno-agui-cookbook/data/` — 示例文档

**需要创建的组件:**
- `KnowledgeRagDemo` — 页面导出
- `Chat` — `CopilotChat` 全屏，可复用 agentic-chat 的简单聊天模式
- 可选: `SourceCard` — 展示检索到的文档来源

- [ ] **Step 1:** 准备示例数据文件 (Markdown/PDF/TXT 文档)

- [ ] **Step 2:** 创建 Python agent：
  - 使用 Agno 的 `knowledge` 参数配置知识库
  - 参考 `cookbook/07_knowledge/` 的模式
  - 使用嵌入模型 + 本地向量存储 (或 SQLite 向量扩展)

- [ ] **Step 3:** 创建前端 page.tsx — 文档问答对话界面

- [ ] **Step 4:** 验证 RAG 检索 + 回答质量

### Task 4.2: Workflows (多步骤工作流)

**Files:**
- Create: `agno-agui-cookbook/src/agents/workflow_agent.py`
- Create: `agno-agui-cookbook/src/app/demos/workflows/page.tsx`

**需要创建的组件:**
- `WorkflowsDemo` — 页面导出
- `WorkflowProgress` — 工作流阶段进度展示 (类似 `TaskProgress` 但按阶段分组)
- `Chat` — `CopilotChat` 或 `CopilotSidebar`

- [ ] **Step 1:** 创建 Python workflow：
  - 参考 `cookbook/04_workflows/` 的模式
  - 实现多步骤工作流 (如: 调研 → 分析 → 报告)
  - 使用 Agno 的 Workflow 类

- [ ] **Step 2:** 创建前端 page.tsx — 工作流状态展示 + 对话

- [ ] **Step 3:** 验证完整工作流执行

---

## Phase 5: Gen-UI Agent (A2UI 动态面板)

### Task 5.1: Gen-UI Agent

**前端参考:** `showcase/demos/gen-ui-agent/page.tsx`

**Files:**
- Create: `agno-agui-cookbook/src/agents/gen_ui_agent.py`
- Create: `agno-agui-cookbook/src/app/demos/gen-ui-agent/page.tsx`

**需要创建的组件:**
- `GenUiAgentDemo` — 页面导出
- `Chat` — `useAgent` + `CopilotChat` 带自定义 `messageView.children`
- `TaskProgress` — 任务步骤进度组件 (进度条 + 步骤列表 + pending/completed/executing 动画)
- `CheckIcon` / `SpinnerIcon` / `ClockIcon` — SVG 状态图标

**关键模式 (参考 showcase):**
- `CopilotChat` 的 `messageView` prop 支持自定义消息渲染:
  ```tsx
  <CopilotChat messageView={{
    children: ({ messageElements, interruptElement }) => (
      <div>
        {messageElements}
        {steps && <TaskProgress steps={steps} />}
        {interruptElement}
      </div>
    )
  }} />
  ```
- agent 通过 `STATE_SNAPSHOT` 推送状态，`useAgent` 自动更新

- [ ] **Step 1:** 创建 Python agent：
  - 使用二次 LLM 调用生成动态 UI schema
  - 参考 showcase 的 `generate_a2ui` 工具模式

- [ ] **Step 2:** 创建前端 page.tsx：
  - 使用 `@copilotkit/a2ui-renderer` 渲染动态 UI
  - 支持 agent 动态生成 dashboard/面板

- [ ] **Step 3:** 验证动态面板生成功能

---

## Phase 6: 文档与收尾

### Task 6.1: 完善文档

**Files:**
- Modify: `agno-agui-cookbook/README.md`
- Create: `agno-agui-cookbook/docs/architecture.md` (可选)

- [ ] **Step 1:** 完善 README.md：
  - 项目概述、架构图 (ASCII)
  - 安装步骤 (Node.js + Python)
  - 各 Demo 说明表格
  - 环境变量说明
  - 开发指南

- [ ] **Step 2:** 每个 demo 目录添加 `README.md` 说明文件

### Task 6.2: 首页完善

**Files:**
- Modify: `agno-agui-cookbook/src/app/page.tsx`

- [ ] **Step 1:** 更新首页 Demo 列表 — 展示所有已实现的 demo 卡片
  - 产品卡片: 彩色渐变背景 (pink/purple/orange/blue)，20px–24px 圆角
  - 卡片阴影: `rgba(44, 30, 116, 0.16) 0px 0px 15px` (品牌紫调辉光)
  - 卡片标题: Outfit 28px weight 600
  - 卡片描述: DM Sans 16px weight 400
- [ ] **Step 2:** 添加分类标签 (基础、高级、Agno 特色) — 药丸形标签 (9999px radius)
- [ ] **Step 3:** 验证所有链接正常跳转
- [ ] **Step 4:** 验证响应式行为 — 桌面 3–4 列 → 平板 2 列 → 手机单列堆叠

---

## 项目文件结构总览

```
agno-agui-cookbook/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── requirements.txt
├── .env.example
├── .gitignore
├── README.md
├── docs/
│   └── design/
│       └── design.md                 # MiniMax-inspired 前端设计系统规范
├── public/
│   └── .gitkeep
├── data/                              # RAG 示例文档
│   └── sample_docs/
├── src/
│   ├── agent_server.py                # FastAPI + AgentOS 入口
│   ├── agents/                        # Python Agent 定义
│   │   ├── agentic_chat.py           # 基础对话 agent
│   │   ├── tool_rendering.py         # 工具渲染 agent
│   │   ├── hitl.py                   # 人类审批 agent
│   │   ├── gen_ui.py                 # 动态 UI agent
│   │   ├── gen_ui_agent.py           # A2UI agent
│   │   ├── shared_state.py           # 共享状态 agent
│   │   ├── subagents.py              # 子 agent 委托
│   │   ├── knowledge_agent.py        # RAG 知识检索 agent
│   │   └── workflow_agent.py         # 工作流 agent
│   └── app/                           # Next.js 前端
│       ├── layout.tsx
│       ├── globals.css
│       ├── page.tsx                   # Demo 首页
│       ├── api/
│       │   └── copilotkit/
│       │       └── route.ts          # CopilotKit API 代理
│       └── demos/
│           ├── agentic-chat/
│           │   └── page.tsx
│           ├── tool-rendering/
│           │   └── page.tsx
│           ├── hitl/
│           │   └── page.tsx
│           ├── gen-ui-tool-based/
│           │   └── page.tsx
│           ├── gen-ui-agent/
│           │   └── page.tsx
│           ├── shared-state-read/
│           │   └── page.tsx
│           ├── shared-state-write/
│           │   └── page.tsx
│           ├── shared-state-streaming/
│           │   └── page.tsx
│           ├── subagents/
│           │   └── page.tsx
│           ├── knowledge-rag/
│           │   └── page.tsx
│           └── workflows/
│               └── page.tsx
```

---

## Relevant Files (参考源)

### Python 后端参考
- `CopilotKit/showcase/packages/agno/src/agent_server.py` — AgentOS + AGUI 入口模式
- `CopilotKit/showcase/packages/agno/src/agents/main.py` — Agent 定义 + 8 个工具 + system prompt 模式
- `CopilotKit/showcase/packages/agno/requirements.txt` — Python 依赖参考
- `agno/cookbook/00_quickstart/` — Agno Agent 基础模式
- `agno/cookbook/07_knowledge/` — Agno RAG/Knowledge 模式
- `agno/cookbook/04_workflows/` — Agno Workflow 模式
- `agno/cookbook/03_teams/` — Agno Team/多 Agent 模式

### 前端参考 (CopilotKit showcase app)
- `showcase/.../src/app/layout.tsx` — 根布局 + CopilotKit v2 样式导入
- `showcase/.../src/app/page.tsx` — Demo 首页卡片列表
- `showcase/.../src/app/globals.css` — 全局 CSS
- `showcase/.../src/app/api/copilotkit/route.ts` — HttpAgent 代理 + CopilotRuntime + agent 注册
- `showcase/.../src/app/demos/agentic-chat/page.tsx` — useFrontendTool + useRenderTool + useAgentContext
- `showcase/.../src/app/demos/tool-rendering/page.tsx` — useRenderTool + WeatherCard/WeatherIcon 组件
- `showcase/.../src/app/demos/hitl/page.tsx` — useHumanInTheLoop + useLangGraphInterrupt + StepSelector/StepsFeedback
- `showcase/.../src/app/demos/gen-ui-tool-based/page.tsx` — useFrontendTool + Zod schema + HaikuCard + followUp:false
- `showcase/.../src/app/demos/gen-ui-agent/page.tsx` — useAgent + messageView.children + TaskProgress
- `showcase/.../src/app/demos/shared-state-read/page.tsx` — useAgent + UseAgentUpdate + 表单双向绑定
- `showcase/.../src/app/demos/shared-state-write/page.tsx` — TODO 占位
- `showcase/.../src/app/demos/shared-state-streaming/page.tsx` — TODO 占位
- `showcase/.../src/app/demos/subagents/page.tsx` — TODO 占位

### 设计参考
- `agno-agui-cookbook/docs/design/design.md` — MiniMax-inspired 前端设计系统 (色彩、字体、组件、布局、阴影规范)
- `CopilotKit/showcase/packages/agno/package.json` — 依赖版本参考

---

## Verification (验证步骤)

1. `pnpm install` 无报错
2. `pip install -r requirements.txt` 无报错
3. `pnpm dev` 可以同时启动 Next.js (port 3000) + Uvicorn (port 8000)
4. 访问 `http://localhost:3000` 显示 Demo 首页
5. 访问 `http://localhost:8000/health` 返回健康状态
6. 逐个验证每个 Demo 页面：
   - `/demos/agentic-chat` — 发送消息，收到 AI 回复
   - `/demos/tool-rendering` — 触发天气查询，显示 WeatherCard
   - `/demos/hitl` — 触发审批流程，确认/拒绝正常
   - `/demos/gen-ui-tool-based` — 动态数据卡片正常渲染
   - `/demos/gen-ui-agent` — A2UI 动态面板正常
   - `/demos/shared-state-read` — agent 状态实时显示
   - `/demos/shared-state-write` — 前端数据传入 agent
   - `/demos/shared-state-streaming` — 流式状态更新
   - `/demos/subagents` — 多 Agent 委托正常
   - `/demos/knowledge-rag` — 文档检索回答正常
   - `/demos/workflows` — 工作流执行正常
7. TypeScript 编译无错误 (`npx tsc --noEmit`)

---

## Decisions (决策记录)

- **完全独立项目**：不依赖 CopilotKit monorepo 内部包，只使用 npm 发布的 `@copilotkit/*` 包
- **不含 Docker**：只做本地开发环境，不提供 Dockerfile
- **不含 E2E 测试**：后续需要时再加
- **OpenAI gpt-4o**：统一使用 OpenAI 作为 LLM provider
- **单一 agent_server.py**：所有 agent 在同一个 FastAPI 服务中运行，通过不同路由区分
- **每个 demo 独立 agent 文件**：便于学习，每个 demo 有自己的 Python agent 定义
- **Agno 特色 demo**：除了复刻 showcase 的标准 demo 外，增加 Knowledge/RAG 和 Workflow demo，展示 Agno 框架独有能力
- **showcase 占位 demo 需自行实现**：shared-state-write, shared-state-streaming, subagents 在 showcase 中是 TODO 占位，我们的 cookbook 需要独立实现完整功能

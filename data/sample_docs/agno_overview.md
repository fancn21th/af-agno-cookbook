# Agno Framework Overview

Agno is an open-source framework for building multi-modal AI agents. It is designed to be lightweight, performant, and production-ready.

## Key Features

### Agent Architecture

Agno agents are composed of the following core components:

- **Model**: The LLM powering the agent (e.g., OpenAI, Anthropic, Gemini)
- **Tools**: Functions the agent can call to interact with external systems
- **Knowledge**: A vector database of documents the agent can search
- **Storage**: A database layer for persisting sessions and agent state
- **Memory**: User-level facts that persist across conversations

### Multi-Modal Capabilities

Agno agents can process text, images, audio, and video natively. You can pass multi-modal input directly in the message or attach files.

### AgentOS

AgentOS is Agno's container for running agents as services. It manages:

- Lifecycle of multiple agents
- Interface adapters (AG-UI, API, WebSocket)
- Health monitoring
- Session management

## Agent Types

### Single Agent

The most basic pattern. One LLM with tools and optional knowledge:

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat

agent = Agent(
    model=OpenAIChat(id="gpt-4o"),
    instructions=["You are a helpful assistant."],
)
agent.print_response("Hello!")
```

### Agent Teams

Multiple agents working together, coordinated by a team leader:

```python
from agno.team.team import Team

team = Team(
    name="research_team",
    agents=[researcher, analyst, writer],
    instructions=["Coordinate the team to answer questions."],
)
```

### Workflows

Sequential or parallel pipelines of agents:

```python
from agno.workflow.workflow import Workflow

class ResearchWorkflow(Workflow):
    def run(self, topic: str):
        # Step 1: Research
        research = self.researcher.run(f"Research: {topic}")
        # Step 2: Analyze
        analysis = self.analyst.run(f"Analyze: {research.content}")
        # Step 3: Write
        return self.writer.run(f"Write report: {analysis.content}")
```

## Tools

Tools are Python functions that agents can call. They can be simple:

```python
from agno.tools import tool

@tool
def get_weather(location: str) -> str:
    return f"The weather in {location} is sunny."
```

Or complex with external API calls, database queries, or file operations.

### External Execution Tools

Tools with `external_execution=True` pause the agent and send the call to the frontend (Human-in-the-Loop):

```python
@tool(external_execution=True)
def approve_action(action: str, reason: str) -> str:
    # This code runs AFTER the frontend responds
    return f"Action approved: {action}"
```

## Knowledge and RAG

Agno supports multiple vector databases for retrieval-augmented generation:

- **LanceDB** (recommended, local-first)
- **PgVector** (PostgreSQL extension)
- **Qdrant**, **Weaviate**, **Pinecone**, **ChromaDB**, and more

Documents are loaded from files (text, PDF, JSON, CSV) or URLs.

## Models

Agno supports all major LLM providers:

| Provider | Class |
|----------|-------|
| OpenAI | `OpenAIChat`, `OpenAIResponses` |
| Anthropic | `Claude` |
| Google | `Gemini` |
| Meta | `OllamaChat` (via Ollama) |
| Mistral | `MistralChat` |
| AWS | `BedrockChat` |

## Performance

Agno is benchmarked to be one of the fastest agent frameworks, with agent instantiation times under 5ms and minimal memory overhead.

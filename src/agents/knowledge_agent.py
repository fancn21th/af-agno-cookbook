"""
Knowledge Agent

Demonstrates Agno's FileSystemKnowledge feature.
The agent answers questions grounded in a local document corpus
using built-in file tools (grep_file, list_files, get_file).
"""

from pathlib import Path
from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.knowledge import FileSystemKnowledge
from dotenv import load_dotenv

load_dotenv()

# Path to the sample documents
DOCS_DIR = Path(__file__).parent.parent.parent / "data" / "sample_docs"

knowledge_base = FileSystemKnowledge(
    base_dir=str(DOCS_DIR),
    include_patterns=["*.md", "*.txt"],
)

agent = Agent(
    name="knowledge-rag",
    model=OpenAIChat(id="gpt-4o"),
    knowledge=knowledge_base,
    search_knowledge=True,
    instructions=[
        "You are a knowledgeable assistant with access to a document library.",
        "Always search your knowledge base before answering questions.",
        "Use grep_file to search for relevant content and get_file to read full documents.",
        "Cite the relevant document names when providing answers.",
        "If information is not in your knowledge base, say so clearly.",
    ],
    markdown=True,
)

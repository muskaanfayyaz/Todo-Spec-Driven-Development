# T-331, T-332, T-333: Agent Layer
# Spec: agent.spec.md
#
# AI agent for natural language task management.
# Stateless execution with MCP tools ONLY.

from .config import AGENT_CONFIG, SYSTEM_PROMPT
from .executor import AgentExecutor
from .result import AgentResult, ToolCallRecord

__all__ = [
    "AGENT_CONFIG",
    "SYSTEM_PROMPT",
    "AgentExecutor",
    "AgentResult",
    "ToolCallRecord",
]

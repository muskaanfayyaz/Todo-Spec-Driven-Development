# T-333: Agent Result Schema
# Spec: agent.spec.md Section 5, chat-api.spec.md Section 4
#
# Immutable result objects for agent execution.

from dataclasses import dataclass, field
from typing import List, Any, Optional


@dataclass(frozen=True)
class ToolCallRecord:
    """
    Record of a single tool invocation.

    Captures the tool name, arguments passed, and result returned
    for transparency in the API response.
    """

    tool: str
    """Name of the MCP tool that was called."""

    arguments: dict
    """Arguments passed to the tool (excluding user_id for security)."""

    result: Any
    """Result returned by the tool."""


@dataclass(frozen=True)
class AgentResult:
    """
    Result of agent execution.

    Immutable object containing everything needed for the API response:
    - conversation_id: For continuing the conversation
    - response: The assistant's text response
    - tool_calls: Transparency record of all tools invoked
    """

    conversation_id: int
    """ID of the conversation (new or existing)."""

    response: str
    """Assistant's text response to the user."""

    tool_calls: List[ToolCallRecord] = field(default_factory=list)
    """List of tools invoked during this request."""

    @classmethod
    def error(cls, conversation_id: int, message: str) -> "AgentResult":
        """
        Create an error result.

        Args:
            conversation_id: Conversation ID (0 if not created)
            message: Error message to show user

        Returns:
            AgentResult with error message as response
        """
        return cls(
            conversation_id=conversation_id,
            response=message,
            tool_calls=[],
        )

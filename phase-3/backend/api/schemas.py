# T-341: Chat Request/Response Schemas
# Spec: chat-api.spec.md Sections 3, 4
#
# Pydantic models for chat endpoint validation and serialization.

from typing import Optional, List, Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """
    Request body for POST /api/{user_id}/chat.

    Spec: chat-api.spec.md Section 3.3
    """

    conversation_id: Optional[int] = Field(
        default=None,
        description="ID of existing conversation. Null to start new conversation.",
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="User's message to the assistant",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "conversation_id": None,
                    "message": "Add a task to buy groceries",
                },
                {
                    "conversation_id": 123,
                    "message": "Mark my last task as complete",
                },
            ]
        }
    }


class ToolCallResponse(BaseModel):
    """
    Record of a single tool invocation.

    Spec: chat-api.spec.md Section 4.2
    """

    tool: str = Field(..., description="Name of the MCP tool called")
    arguments: dict = Field(..., description="Arguments passed to the tool")
    result: Any = Field(..., description="Result returned by the tool")


class ChatResponse(BaseModel):
    """
    Response body for POST /api/{user_id}/chat.

    Spec: chat-api.spec.md Section 4.3
    """

    conversation_id: int = Field(
        ...,
        description="ID of the conversation (new or existing)",
    )
    response: str = Field(
        ...,
        description="Assistant's text response to the user",
    )
    tool_calls: List[ToolCallResponse] = Field(
        default_factory=list,
        description="List of tools invoked during this request",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "conversation_id": 123,
                    "response": "I've added 'Buy groceries' to your task list. Is there anything else?",
                    "tool_calls": [
                        {
                            "tool": "add_task",
                            "arguments": {"title": "Buy groceries"},
                            "result": {
                                "task_id": 42,
                                "status": "created",
                                "title": "Buy groceries",
                            },
                        }
                    ],
                }
            ]
        }
    }

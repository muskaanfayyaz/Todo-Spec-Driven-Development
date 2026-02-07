# T-312: Message SQLModel
# Spec: conversation.spec.md Section 4.5
#
# NEW table for Phase III. Stores individual messages within conversations.

from datetime import datetime
from typing import Optional, Any, Literal

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON


class MessageDB(SQLModel, table=True):
    """
    Individual message within a conversation.

    Stores both user messages and assistant responses, including
    tool call records for transparency.

    Phase II Integration:
    - FK to user.id (redundant for security - defense in depth)
    - Does NOT modify Phase II tables
    """

    __tablename__ = "message"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(
        foreign_key="conversation.id",
        index=True,
        nullable=False,
        description="FK to conversation table",
    )
    user_id: str = Field(
        foreign_key="user.id",
        index=True,
        nullable=False,
        description="FK to Phase II user table (redundant for security)",
    )
    role: str = Field(
        nullable=False,
        description="Message role: 'user' or 'assistant'",
    )
    content: str = Field(
        nullable=False,
        description="Message text content",
    )
    tool_calls: Optional[Any] = Field(
        default=None,
        sa_column=Column(JSON),
        description="Tool invocations (assistant messages only)",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Message timestamp",
    )


# Type alias for role validation
MessageRole = Literal["user", "assistant"]

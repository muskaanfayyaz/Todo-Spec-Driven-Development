# T-311: Conversation SQLModel
# Spec: conversation.spec.md Section 3.5
#
# NEW table for Phase III. References Phase II user.id via FK.

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class ConversationDB(SQLModel, table=True):
    """
    Conversation container for chat sessions.

    Each conversation belongs to exactly one user and contains
    a sequence of messages between the user and assistant.

    Phase II Integration:
    - FK to user.id (Better Auth table, Phase II)
    - Does NOT modify Phase II tables
    """

    __tablename__ = "conversation"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(
        foreign_key="user.id",
        index=True,
        nullable=False,
        description="FK to Phase II user table (Better Auth)",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="When conversation started",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last activity timestamp",
    )

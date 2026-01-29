# T-315: Message Repository
# Spec: conversation.spec.md Section 6.2
#
# Repository for message persistence with user isolation.

from datetime import datetime
from typing import Optional, List, Any

from sqlmodel import Session, select

from ..models.message import MessageDB


class MessageRepository:
    """
    Repository for message persistence.

    SECURITY: Every query includes user_id filter for isolation.
    """

    def __init__(self, session: Session, user_id: str):
        """
        Initialize repository with session and user context.

        Args:
            session: SQLModel database session
            user_id: Authenticated user ID for data isolation
        """
        self._session = session
        self._user_id = user_id

    def add(
        self,
        conversation_id: int,
        role: str,
        content: str,
        tool_calls: Optional[Any] = None,
    ) -> MessageDB:
        """
        Add a message to a conversation.

        Args:
            conversation_id: ID of the conversation
            role: "user" or "assistant"
            content: Message text content
            tool_calls: Tool invocations (assistant messages only)

        Returns:
            Created MessageDB with generated ID
        """
        message = MessageDB(
            conversation_id=conversation_id,
            user_id=self._user_id,  # Redundant but required for security
            role=role,
            content=content,
            tool_calls=tool_calls,
            created_at=datetime.utcnow(),
        )
        self._session.add(message)
        self._session.flush()  # Get ID without committing
        return message

    def get_history(self, conversation_id: int) -> List[MessageDB]:
        """
        Get all messages for a conversation in chronological order.

        SECURITY: Filters by user_id to prevent cross-user access.

        Args:
            conversation_id: Conversation ID to get messages for

        Returns:
            List of MessageDB ordered by created_at ASC
        """
        statement = (
            select(MessageDB)
            .where(
                MessageDB.conversation_id == conversation_id,
                MessageDB.user_id == self._user_id,  # CRITICAL: User isolation
            )
            .order_by(MessageDB.created_at.asc())
        )
        return list(self._session.exec(statement).all())

    def get_latest(self, conversation_id: int) -> Optional[MessageDB]:
        """
        Get most recent message in conversation.

        Args:
            conversation_id: Conversation ID

        Returns:
            Most recent MessageDB or None
        """
        statement = (
            select(MessageDB)
            .where(
                MessageDB.conversation_id == conversation_id,
                MessageDB.user_id == self._user_id,
            )
            .order_by(MessageDB.created_at.desc())
            .limit(1)
        )
        return self._session.exec(statement).first()

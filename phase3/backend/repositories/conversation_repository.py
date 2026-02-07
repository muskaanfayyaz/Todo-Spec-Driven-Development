# T-314: Conversation Repository
# Spec: conversation.spec.md Section 6.1
#
# Repository for conversation persistence with user isolation.

from datetime import datetime
from typing import Optional, List

from sqlmodel import Session, select

from ..models.conversation import ConversationDB


class ConversationRepository:
    """
    Repository for conversation persistence.

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

    def create(self) -> ConversationDB:
        """
        Create a new conversation for the user.

        Returns:
            Created ConversationDB with generated ID
        """
        conversation = ConversationDB(
            user_id=self._user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        self._session.add(conversation)
        self._session.flush()  # Get ID without committing
        return conversation

    def get_by_id(self, conversation_id: int) -> Optional[ConversationDB]:
        """
        Get conversation by ID if it belongs to the user.

        SECURITY: Filters by user_id to prevent cross-user access.

        Args:
            conversation_id: Conversation ID to retrieve

        Returns:
            ConversationDB if found and owned by user, None otherwise
        """
        statement = select(ConversationDB).where(
            ConversationDB.id == conversation_id,
            ConversationDB.user_id == self._user_id,  # CRITICAL: User isolation
        )
        return self._session.exec(statement).first()

    def list_by_user(self, limit: int = 20, offset: int = 0) -> List[ConversationDB]:
        """
        List user's conversations, most recent first.

        Args:
            limit: Maximum number of conversations to return
            offset: Number of conversations to skip

        Returns:
            List of ConversationDB ordered by updated_at DESC
        """
        statement = (
            select(ConversationDB)
            .where(ConversationDB.user_id == self._user_id)
            .order_by(ConversationDB.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(self._session.exec(statement).all())

    def update_timestamp(self, conversation_id: int) -> None:
        """
        Update conversation's updated_at to now.

        Called when a new message is added.

        Args:
            conversation_id: Conversation ID to update
        """
        conversation = self.get_by_id(conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            self._session.add(conversation)

    def delete(self, conversation_id: int) -> bool:
        """
        Delete conversation if it belongs to user.

        Args:
            conversation_id: Conversation ID to delete

        Returns:
            True if deleted, False if not found
        """
        conversation = self.get_by_id(conversation_id)
        if conversation:
            self._session.delete(conversation)
            return True
        return False

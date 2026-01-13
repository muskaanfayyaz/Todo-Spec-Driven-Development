"""
Database Models (SQLModel)

Infrastructure layer database representations.
Maps to domain entities via repository pattern.
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class UserDB(SQLModel, table=True):
    """
    User model for referential integrity.

    This table is managed by Better Auth.
    We define it here only so SQLModel knows about it for foreign keys.
    DO NOT use create_all() to create this table - Better Auth handles it.
    """

    __tablename__ = "user"
    __table_args__ = {'extend_existing': True}  # Don't try to create, just reference

    id: str = Field(primary_key=True)
    email: str
    name: str


class TaskDB(SQLModel, table=True):
    """
    Database model for tasks table.

    Represents the infrastructure layer view of a Task.
    Maps to Domain Task entity via PostgreSQLTaskRepository.

    Attributes:
        id: Auto-incrementing primary key
        user_id: Foreign key to user.id (owner)
        title: Task title (1-200 chars)
        description: Task description (0-1000 chars, optional)
        completed: Completion status (boolean)
        created_at: Creation timestamp
        updated_at: Last modification timestamp
    """

    __tablename__ = "tasks"

    # Primary key
    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Auto-incrementing task ID"
    )

    # Foreign key to user table (Better Auth uses singular "user")
    user_id: str = Field(
        foreign_key="user.id",
        index=True,
        description="Task owner user ID"
    )

    # Task content
    title: str = Field(
        max_length=200,
        description="Task title"
    )

    description: Optional[str] = Field(
        default="",
        description="Task description (optional)"
    )

    # Status
    completed: bool = Field(
        default=False,
        description="Task completion status"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Task creation timestamp"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )

    class Config:
        """SQLModel configuration."""
        schema_extra = {
            "example": {
                "id": 42,
                "user_id": "user-123",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2026-01-03T10:30:00Z",
                "updated_at": "2026-01-03T10:30:00Z"
            }
        }


# Note: users table is managed by Better Auth
# We do NOT define it here - it's created and managed by Better Auth

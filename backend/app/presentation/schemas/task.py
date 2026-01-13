"""
Task Request/Response Schemas

Pydantic models for API request validation and response serialization.
Maps between API JSON and domain entities.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class TaskCreateRequest(BaseModel):
    """
    Request schema for creating a new task.

    Validation Rules:
    - title: Required, 1-200 characters
    - description: Optional, 0-1000 characters
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters)",
        examples=["Buy groceries"],
    )
    description: Optional[str] = Field(
        default="",
        max_length=1000,
        description="Task description (0-1000 characters)",
        examples=["Milk, eggs, bread"],
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is not empty after stripping whitespace."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> str:
        """Normalize description (strip whitespace, handle None)."""
        if v is None:
            return ""
        return v.strip()


class TaskUpdateRequest(BaseModel):
    """
    Request schema for updating an existing task.

    Validation Rules:
    - title: Optional, 1-200 characters (if provided)
    - description: Optional, 0-1000 characters (if provided)
    - At least one field must be provided

    Note: This is a partial update (PATCH semantics with PUT method).
    Only provided fields are updated.
    """

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="New task title (optional)",
        examples=["Buy groceries and cook dinner"],
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="New task description (optional)",
        examples=["Milk, eggs, bread, chicken, vegetables"],
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate title is not empty if provided."""
        if v is not None:
            if not v.strip():
                raise ValueError("Title cannot be empty or whitespace only")
            return v.strip()
        return None

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Normalize description if provided."""
        if v is not None:
            return v.strip()
        return None

    def model_post_init(self, __context) -> None:
        """Validate that at least one field is provided."""
        if self.title is None and self.description is None:
            raise ValueError("At least one field (title or description) must be provided")


class TaskResponse(BaseModel):
    """
    Response schema for task data.

    Represents a task as returned by the API.
    Maps from domain Task entity.
    """

    id: int = Field(
        ..., description="Unique task identifier", examples=[42]
    )
    title: str = Field(
        ..., description="Task title", examples=["Buy groceries"]
    )
    description: str = Field(
        ..., description="Task description", examples=["Milk, eggs, bread"]
    )
    completed: bool = Field(
        ..., description="Completion status (true = completed, false = pending)", examples=[False]
    )
    created_at: datetime = Field(
        ..., description="Creation timestamp (ISO 8601)", examples=["2026-01-03T10:30:00Z"]
    )
    updated_at: datetime = Field(
        ..., description="Last update timestamp (ISO 8601)", examples=["2026-01-03T11:15:00Z"]
    )

    class Config:
        """Pydantic model configuration."""

        from_attributes = True  # Enable ORM mode for SQLModel compatibility
        json_schema_extra = {
            "example": {
                "id": 42,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2026-01-03T10:30:00Z",
                "updated_at": "2026-01-03T11:15:00Z",
            }
        }

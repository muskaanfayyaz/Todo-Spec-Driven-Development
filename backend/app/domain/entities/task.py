"""Task entity."""
from datetime import datetime
from app.domain.value_objects.task_status import TaskStatus
from app.domain.exceptions import TaskValidationError


class Task:
    """Task entity representing a todo item."""

    def __init__(
        self,
        id: int,
        title: str,
        description: str = "",
        status: TaskStatus = TaskStatus.PENDING,
        created_at: datetime = None
    ):
        """Initialize a task.

        Args:
            id: Unique task identifier
            title: Task title (1-200 characters)
            description: Task description (0-1000 characters)
            status: Task status (default: PENDING)
            created_at: Creation timestamp (default: now)

        Raises:
            TaskValidationError: If validation fails
        """
        self._id = id
        self._created_at = created_at or datetime.now()
        self._status = status

        # Validate and set title
        self._validate_title(title)
        self._title = title

        # Validate and set description
        self._validate_description(description)
        self._description = description

    @property
    def id(self) -> int:
        """Get task ID (immutable)."""
        return self._id

    @property
    def title(self) -> str:
        """Get task title."""
        return self._title

    @property
    def description(self) -> str:
        """Get task description."""
        return self._description

    @property
    def status(self) -> TaskStatus:
        """Get task status."""
        return self._status

    @property
    def created_at(self) -> datetime:
        """Get creation timestamp (immutable)."""
        return self._created_at

    def complete(self) -> None:
        """Mark task as completed."""
        self._status = TaskStatus.COMPLETED

    def uncomplete(self) -> None:
        """Mark task as pending."""
        self._status = TaskStatus.PENDING

    def update_title(self, title: str) -> None:
        """Update task title.

        Args:
            title: New title

        Raises:
            TaskValidationError: If validation fails
        """
        self._validate_title(title)
        self._title = title

    def update_description(self, description: str) -> None:
        """Update task description.

        Args:
            description: New description

        Raises:
            TaskValidationError: If validation fails
        """
        self._validate_description(description)
        self._description = description

    @staticmethod
    def _validate_title(title: str) -> None:
        """Validate task title.

        Args:
            title: Title to validate

        Raises:
            TaskValidationError: If validation fails
        """
        if not title or not title.strip():
            raise TaskValidationError("Title is required")
        if len(title) > 200:
            raise TaskValidationError(
                "Title exceeds maximum length of 200 characters"
            )

    @staticmethod
    def _validate_description(description: str) -> None:
        """Validate task description.

        Args:
            description: Description to validate

        Raises:
            TaskValidationError: If validation fails
        """
        if len(description) > 1000:
            raise TaskValidationError(
                "Description exceeds maximum length of 1000 characters"
            )

    def __repr__(self) -> str:
        """String representation of task."""
        return (
            f"Task(id={self.id}, title='{self.title}', "
            f"status={self.status.value})"
        )

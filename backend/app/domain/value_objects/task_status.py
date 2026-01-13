"""Task status value object."""
from enum import Enum


class TaskStatus(Enum):
    """Task status enumeration."""

    PENDING = "pending"
    COMPLETED = "completed"

    def is_completed(self) -> bool:
        """Check if status is completed."""
        return self == TaskStatus.COMPLETED

    def is_pending(self) -> bool:
        """Check if status is pending."""
        return self == TaskStatus.PENDING

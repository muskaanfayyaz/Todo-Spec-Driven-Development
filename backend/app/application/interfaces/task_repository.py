"""Task repository interface."""
from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.entities.task import Task


class TaskRepository(ABC):
    """Abstract base class for task repository."""

    @abstractmethod
    def add(self, task: Task) -> Task:
        """Add a new task.

        Args:
            task: Task to add

        Returns:
            Added task
        """
        pass

    @abstractmethod
    def get_by_id(self, task_id: int) -> Optional[Task]:
        """Get task by ID.

        Args:
            task_id: Task identifier

        Returns:
            Task if found, None otherwise
        """
        pass

    @abstractmethod
    def get_all(self) -> List[Task]:
        """Get all tasks.

        Returns:
            List of all tasks
        """
        pass

    @abstractmethod
    def update(self, task: Task) -> Task:
        """Update an existing task.

        Args:
            task: Task to update

        Returns:
            Updated task
        """
        pass

    @abstractmethod
    def delete(self, task_id: int) -> bool:
        """Delete a task.

        Args:
            task_id: Task identifier

        Returns:
            True if deleted, False otherwise
        """
        pass

    @abstractmethod
    def exists(self, task_id: int) -> bool:
        """Check if task exists.

        Args:
            task_id: Task identifier

        Returns:
            True if exists, False otherwise
        """
        pass

    @abstractmethod
    def get_next_id(self) -> int:
        """Get next available ID.

        Returns:
            Next task ID
        """
        pass

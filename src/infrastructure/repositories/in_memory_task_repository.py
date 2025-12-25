"""In-memory task repository implementation."""
from typing import Optional, List, Dict
from application.interfaces.task_repository import TaskRepository
from domain.entities.task import Task


class InMemoryTaskRepository(TaskRepository):
    """In-memory implementation of task repository."""

    def __init__(self):
        """Initialize repository."""
        self._tasks: Dict[int, Task] = {}
        self._next_id: int = 1

    def add(self, task: Task) -> Task:
        """Add a new task.

        Args:
            task: Task to add

        Returns:
            Added task
        """
        self._tasks[task.id] = task
        self._next_id = task.id + 1
        return task

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """Get task by ID.

        Args:
            task_id: Task identifier

        Returns:
            Task if found, None otherwise
        """
        return self._tasks.get(task_id)

    def get_all(self) -> List[Task]:
        """Get all tasks.

        Returns:
            List of all tasks ordered by ID
        """
        return sorted(self._tasks.values(), key=lambda t: t.id)

    def update(self, task: Task) -> Task:
        """Update an existing task.

        Args:
            task: Task to update

        Returns:
            Updated task
        """
        self._tasks[task.id] = task
        return task

    def delete(self, task_id: int) -> bool:
        """Delete a task.

        Args:
            task_id: Task identifier

        Returns:
            True if deleted, False otherwise
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def exists(self, task_id: int) -> bool:
        """Check if task exists.

        Args:
            task_id: Task identifier

        Returns:
            True if exists, False otherwise
        """
        return task_id in self._tasks

    def get_next_id(self) -> int:
        """Get next available ID.

        Returns:
            Next task ID
        """
        return self._next_id

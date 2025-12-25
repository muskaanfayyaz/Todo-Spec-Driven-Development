"""Update task use case."""
from typing import Optional
from application.interfaces.task_repository import TaskRepository
from domain.entities.task import Task
from domain.exceptions import TaskNotFoundError


class UpdateTaskUseCase:
    """Use case for updating a task."""

    def __init__(self, repository: TaskRepository):
        """Initialize use case.

        Args:
            repository: Task repository
        """
        self.repository = repository

    def execute(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> Task:
        """Update a task.

        Args:
            task_id: Task identifier
            title: New title (optional)
            description: New description (optional)

        Returns:
            Updated task

        Raises:
            TaskNotFoundError: If task not found
            TaskValidationError: If validation fails
        """
        task = self.repository.get_by_id(task_id)
        if task is None:
            raise TaskNotFoundError(f"Task with ID {task_id} not found")

        if title is not None:
            task.update_title(title)

        if description is not None:
            task.update_description(description)

        return self.repository.update(task)

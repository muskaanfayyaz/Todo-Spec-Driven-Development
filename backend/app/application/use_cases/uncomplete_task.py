"""Uncomplete task use case."""
from app.application.interfaces.task_repository import TaskRepository
from app.domain.entities.task import Task
from app.domain.exceptions import TaskNotFoundError


class UncompleteTaskUseCase:
    """Use case for marking a task as pending."""

    def __init__(self, repository: TaskRepository):
        """Initialize use case.

        Args:
            repository: Task repository
        """
        self.repository = repository

    def execute(self, task_id: int) -> Task:
        """Mark a task as pending.

        Args:
            task_id: Task identifier

        Returns:
            Updated task

        Raises:
            TaskNotFoundError: If task not found
        """
        task = self.repository.get_by_id(task_id)
        if task is None:
            raise TaskNotFoundError(f"Task with ID {task_id} not found")

        task.uncomplete()
        return self.repository.update(task)

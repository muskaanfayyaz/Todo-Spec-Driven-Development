"""Complete task use case."""
from app.application.interfaces.task_repository import TaskRepository
from app.domain.entities.task import Task
from app.domain.exceptions import TaskNotFoundError


class CompleteTaskUseCase:
    """Use case for marking a task as completed."""

    def __init__(self, repository: TaskRepository):
        """Initialize use case.

        Args:
            repository: Task repository
        """
        self.repository = repository

    def execute(self, task_id: int) -> Task:
        """Mark a task as completed.

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

        task.complete()
        return self.repository.update(task)

"""Delete task use case."""
from application.interfaces.task_repository import TaskRepository
from domain.exceptions import TaskNotFoundError


class DeleteTaskUseCase:
    """Use case for deleting a task."""

    def __init__(self, repository: TaskRepository):
        """Initialize use case.

        Args:
            repository: Task repository
        """
        self.repository = repository

    def execute(self, task_id: int) -> bool:
        """Delete a task.

        Args:
            task_id: Task identifier

        Returns:
            True if deleted

        Raises:
            TaskNotFoundError: If task not found
        """
        if not self.repository.exists(task_id):
            raise TaskNotFoundError(f"Task with ID {task_id} not found")

        return self.repository.delete(task_id)

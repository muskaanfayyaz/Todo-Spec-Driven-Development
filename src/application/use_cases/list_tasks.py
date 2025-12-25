"""List tasks use case."""
from typing import List
from application.interfaces.task_repository import TaskRepository
from domain.entities.task import Task


class ListTasksUseCase:
    """Use case for listing all tasks."""

    def __init__(self, repository: TaskRepository):
        """Initialize use case.

        Args:
            repository: Task repository
        """
        self.repository = repository

    def execute(self) -> List[Task]:
        """List all tasks.

        Returns:
            List of all tasks
        """
        return self.repository.get_all()

"""Add task use case."""
from application.interfaces.task_repository import TaskRepository
from domain.entities.task import Task
from domain.value_objects.task_status import TaskStatus


class AddTaskUseCase:
    """Use case for adding a new task."""

    def __init__(self, repository: TaskRepository):
        """Initialize use case.

        Args:
            repository: Task repository
        """
        self.repository = repository

    def execute(self, title: str, description: str = "") -> Task:
        """Add a new task.

        Args:
            title: Task title
            description: Task description (optional)

        Returns:
            Created task

        Raises:
            TaskValidationError: If validation fails
        """
        task_id = self.repository.get_next_id()
        task = Task(
            id=task_id,
            title=title,
            description=description,
            status=TaskStatus.PENDING
        )
        return self.repository.add(task)

"""Main entry point for Todo CLI application."""
from infrastructure.repositories.in_memory_task_repository import (
    InMemoryTaskRepository
)
from application.use_cases.add_task import AddTaskUseCase
from application.use_cases.list_tasks import ListTasksUseCase
from application.use_cases.update_task import UpdateTaskUseCase
from application.use_cases.delete_task import DeleteTaskUseCase
from application.use_cases.complete_task import CompleteTaskUseCase
from application.use_cases.uncomplete_task import UncompleteTaskUseCase
from presentation.cli.command_handlers import (
    AddTaskHandler,
    ListTasksHandler,
    UpdateTaskHandler,
    DeleteTaskHandler,
    CompleteTaskHandler,
    UncompleteTaskHandler,
    HelpHandler,
)
from presentation.cli.cli import TodoCLI


def main():
    """Initialize and run the Todo CLI application."""
    # Create repository
    repository = InMemoryTaskRepository()

    # Create use cases
    add_task_uc = AddTaskUseCase(repository)
    list_tasks_uc = ListTasksUseCase(repository)
    update_task_uc = UpdateTaskUseCase(repository)
    delete_task_uc = DeleteTaskUseCase(repository)
    complete_task_uc = CompleteTaskUseCase(repository)
    uncomplete_task_uc = UncompleteTaskUseCase(repository)

    # Create handlers
    handlers = {
        "add": AddTaskHandler(add_task_uc),
        "list": ListTasksHandler(list_tasks_uc),
        "update": UpdateTaskHandler(update_task_uc),
        "delete": DeleteTaskHandler(delete_task_uc),
        "complete": CompleteTaskHandler(complete_task_uc),
        "uncomplete": UncompleteTaskHandler(uncomplete_task_uc),
        "help": HelpHandler(),
    }

    # Create and run CLI
    cli = TodoCLI(handlers)
    cli.run()


if __name__ == "__main__":
    main()

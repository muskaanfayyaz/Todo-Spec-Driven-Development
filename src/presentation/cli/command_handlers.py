"""Command handlers for CLI."""
from typing import Dict, List, Optional
from application.use_cases.add_task import AddTaskUseCase
from application.use_cases.list_tasks import ListTasksUseCase
from application.use_cases.update_task import UpdateTaskUseCase
from application.use_cases.delete_task import DeleteTaskUseCase
from application.use_cases.complete_task import CompleteTaskUseCase
from application.use_cases.uncomplete_task import UncompleteTaskUseCase
from domain.exceptions import TaskValidationError, TaskNotFoundError
from presentation.cli.formatters import format_task_list, format_task_detail


class CommandHandler:
    """Base class for command handlers."""

    def execute(self, args: List[str]) -> str:
        """Execute the command.

        Args:
            args: Command arguments

        Returns:
            Result message
        """
        raise NotImplementedError


class AddTaskHandler(CommandHandler):
    """Handler for add command."""

    def __init__(self, use_case: AddTaskUseCase):
        """Initialize handler.

        Args:
            use_case: Add task use case
        """
        self.use_case = use_case

    def execute(self, args: List[str]) -> str:
        """Execute add command.

        Args:
            args: [title, description (optional)]

        Returns:
            Success message

        Raises:
            TaskValidationError: If validation fails
        """
        if not args:
            raise TaskValidationError("Title is required\n  Use: add <title> [description]")

        title = args[0]
        description = args[1] if len(args) > 1 else ""

        task = self.use_case.execute(title, description)

        return f"✓ Task created successfully!\n\n{format_task_detail(task)}"


class ListTasksHandler(CommandHandler):
    """Handler for list command."""

    def __init__(self, use_case: ListTasksUseCase):
        """Initialize handler.

        Args:
            use_case: List tasks use case
        """
        self.use_case = use_case

    def execute(self, args: List[str]) -> str:
        """Execute list command.

        Args:
            args: No arguments expected

        Returns:
            Formatted task list
        """
        tasks = self.use_case.execute()
        return format_task_list(tasks)


class UpdateTaskHandler(CommandHandler):
    """Handler for update command."""

    def __init__(self, use_case: UpdateTaskUseCase):
        """Initialize handler.

        Args:
            use_case: Update task use case
        """
        self.use_case = use_case

    def execute(self, args: List[str]) -> str:
        """Execute update command.

        Args:
            args: [task_id, --title, <title>, --description, <description>]

        Returns:
            Success message

        Raises:
            TaskValidationError: If validation fails
            TaskNotFoundError: If task not found
        """
        if not args:
            raise TaskValidationError(
                "Task ID is required\n  Use: update <id> [--title <title>] [--description <desc>]"
            )

        try:
            task_id = int(args[0])
        except ValueError:
            raise TaskValidationError(
                f"Invalid task ID '{args[0]}'\n  Task ID must be a number"
            )

        # Parse flags
        title = None
        description = None
        i = 1
        while i < len(args):
            if args[i] == "--title" and i + 1 < len(args):
                title = args[i + 1]
                i += 2
            elif args[i] == "--description" and i + 1 < len(args):
                description = args[i + 1]
                i += 2
            else:
                i += 1

        if title is None and description is None:
            raise TaskValidationError(
                "At least one field must be provided\n  Use: update <id> [--title <title>] [--description <desc>]"
            )

        task = self.use_case.execute(task_id, title, description)

        return f"✓ Task {task_id} updated successfully!\n\n{format_task_detail(task)}"


class DeleteTaskHandler(CommandHandler):
    """Handler for delete command."""

    def __init__(self, use_case: DeleteTaskUseCase):
        """Initialize handler.

        Args:
            use_case: Delete task use case
        """
        self.use_case = use_case

    def execute(self, args: List[str]) -> str:
        """Execute delete command.

        Args:
            args: [task_id]

        Returns:
            Success message

        Raises:
            TaskValidationError: If validation fails
            TaskNotFoundError: If task not found
        """
        if not args:
            raise TaskValidationError("Task ID is required\n  Use: delete <id>")

        try:
            task_id = int(args[0])
        except ValueError:
            raise TaskValidationError(
                f"Invalid task ID '{args[0]}'\n  Task ID must be a number"
            )

        self.use_case.execute(task_id)

        return f"✓ Task {task_id} deleted successfully!"


class CompleteTaskHandler(CommandHandler):
    """Handler for complete command."""

    def __init__(self, use_case: CompleteTaskUseCase):
        """Initialize handler.

        Args:
            use_case: Complete task use case
        """
        self.use_case = use_case

    def execute(self, args: List[str]) -> str:
        """Execute complete command.

        Args:
            args: [task_id]

        Returns:
            Success message

        Raises:
            TaskValidationError: If validation fails
            TaskNotFoundError: If task not found
        """
        if not args:
            raise TaskValidationError("Task ID is required\n  Use: complete <id>")

        try:
            task_id = int(args[0])
        except ValueError:
            raise TaskValidationError(
                f"Invalid task ID '{args[0]}'\n  Task ID must be a number"
            )

        task = self.use_case.execute(task_id)

        if task.status.is_completed():
            return f"✓ Task {task_id} marked as completed!\n\n  Title: {task.title}\n  Status: completed"
        else:
            return f"✓ Task {task_id} is already completed\n\n  Title: {task.title}\n  Status: completed"


class UncompleteTaskHandler(CommandHandler):
    """Handler for uncomplete command."""

    def __init__(self, use_case: UncompleteTaskUseCase):
        """Initialize handler.

        Args:
            use_case: Uncomplete task use case
        """
        self.use_case = use_case

    def execute(self, args: List[str]) -> str:
        """Execute uncomplete command.

        Args:
            args: [task_id]

        Returns:
            Success message

        Raises:
            TaskValidationError: If validation fails
            TaskNotFoundError: If task not found
        """
        if not args:
            raise TaskValidationError("Task ID is required\n  Use: uncomplete <id>")

        try:
            task_id = int(args[0])
        except ValueError:
            raise TaskValidationError(
                f"Invalid task ID '{args[0]}'\n  Task ID must be a number"
            )

        task = self.use_case.execute(task_id)

        if task.status.is_pending():
            return f"✓ Task {task_id} marked as pending!\n\n  Title: {task.title}\n  Status: pending"
        else:
            return f"✓ Task {task_id} is already pending\n\n  Title: {task.title}\n  Status: pending"


class HelpHandler(CommandHandler):
    """Handler for help command."""

    def execute(self, args: List[str]) -> str:
        """Execute help command.

        Args:
            args: No arguments expected

        Returns:
            Help text
        """
        return """Available Commands:

  add <title> [description]
      Create a new task with a title and optional description
      Example: add "Buy milk" "From the grocery store"

  list
      Display all tasks with their status
      Aliases: ls, all

  update <id> [--title <new_title>] [--description <new_desc>]
      Update a task's title and/or description
      Example: update 1 --title "Buy groceries"

  delete <id>
      Delete a task by its ID
      Aliases: remove, rm

  complete <id>
      Mark a task as completed
      Aliases: done, finish

  uncomplete <id>
      Mark a task as pending (not completed)
      Aliases: incomplete, undo

  help
      Show this help message
      Aliases: ?, h

  exit
      Exit the application
      Aliases: quit, q"""

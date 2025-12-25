"""CLI interface for Todo application."""
import sys
from typing import Dict, List
from domain.exceptions import TodoAppException
from presentation.cli.command_handlers import (
    CommandHandler,
    AddTaskHandler,
    ListTasksHandler,
    UpdateTaskHandler,
    DeleteTaskHandler,
    CompleteTaskHandler,
    UncompleteTaskHandler,
    HelpHandler,
)


class TodoCLI:
    """Command-line interface for Todo application."""

    def __init__(self, handlers: Dict[str, CommandHandler]):
        """Initialize CLI.

        Args:
            handlers: Dictionary mapping command names to handlers
        """
        self.handlers = handlers
        self.running = False

        # Menu options mapping numbers to commands
        self.menu_options = {
            "1": "add",
            "2": "list",
            "3": "update",
            "4": "delete",
            "5": "complete",
            "6": "uncomplete",
            "7": "help",
            "8": "exit",
        }

        # Command aliases (still supported for power users)
        self.aliases = {
            "create": "add",
            "new": "add",
            "ls": "list",
            "all": "list",
            "edit": "update",
            "modify": "update",
            "remove": "delete",
            "rm": "delete",
            "done": "complete",
            "finish": "complete",
            "incomplete": "uncomplete",
            "undo": "uncomplete",
            "?": "help",
            "h": "help",
            "quit": "exit",
            "q": "exit",
        }

    def run(self) -> None:
        """Start the CLI main loop."""
        self.display_welcome()
        self.running = True

        while self.running:
            try:
                self.display_menu()
                sys.stdout.flush()
                user_input = input("\nSelect an option (1-8): ").strip()

                if not user_input:
                    continue

                # Check if input is a menu number
                if user_input in self.menu_options:
                    command = self.menu_options[user_input]

                    if command == "exit":
                        self.running = False
                        self.display_goodbye()
                        break

                    # Get additional input for commands that need it
                    args = self.get_command_args(command)
                    result = self.execute_command(command, args)
                    print(f"\n{result}")
                else:
                    # Fall back to command-based input for power users
                    command, args = self.parse_command(user_input)

                    if command == "exit":
                        self.running = False
                        self.display_goodbye()
                        break

                    result = self.execute_command(command, args)
                    print(f"\n{result}")

            except KeyboardInterrupt:
                print("\n")
                self.running = False
                self.display_goodbye()
                break
            except EOFError:
                print("\n")
                self.running = False
                self.display_goodbye()
                break
            except TodoAppException as e:
                self.display_error(str(e))
            except Exception as e:
                self.display_error(f"Unexpected error: {str(e)}")

    def parse_command(self, user_input: str) -> tuple[str, List[str]]:
        """Parse user input into command and arguments.

        Args:
            user_input: Raw user input

        Returns:
            Tuple of (command, arguments)
        """
        parts = []
        current = []
        in_quotes = False
        quote_char = None

        for char in user_input:
            if char in ('"', "'") and not in_quotes:
                in_quotes = True
                quote_char = char
            elif char == quote_char and in_quotes:
                in_quotes = False
                quote_char = None
                if current:
                    parts.append("".join(current))
                    current = []
            elif char == " " and not in_quotes:
                if current:
                    parts.append("".join(current))
                    current = []
            else:
                current.append(char)

        if current:
            parts.append("".join(current))

        if not parts:
            return "", []

        command = parts[0].lower()
        args = parts[1:] if len(parts) > 1 else []

        # Resolve alias
        command = self.aliases.get(command, command)

        return command, args

    def execute_command(self, command: str, args: List[str]) -> str:
        """Execute a command.

        Args:
            command: Command name
            args: Command arguments

        Returns:
            Result message

        Raises:
            TodoAppException: If command fails
        """
        handler = self.handlers.get(command)
        if handler is None:
            available = ", ".join(sorted(set(self.handlers.keys())))
            raise TodoAppException(
                f"Unknown command '{command}'\n\n"
                f"Available commands: {available}\n"
                f"Type 'help' for more information"
            )

        return handler.execute(args)

    def display_welcome(self) -> None:
        """Display welcome message."""
        print("╔════════════════════════════════════════════════════╗")
        print("║            Welcome to Todo CLI v1.0!               ║")
        print("║        Your simple in-memory task manager          ║")
        print("╚════════════════════════════════════════════════════╝")
        sys.stdout.flush()

    def display_menu(self) -> None:
        """Display main menu."""
        print("\n" + "═" * 54)
        print("MAIN MENU")
        print("═" * 54)
        print("1. Add Task          - Create a new task")
        print("2. List Tasks        - View all tasks")
        print("3. Update Task       - Modify an existing task")
        print("4. Delete Task       - Remove a task")
        print("5. Complete Task     - Mark task as completed")
        print("6. Uncomplete Task   - Mark task as pending")
        print("7. Help              - Show detailed help")
        print("8. Exit              - Quit the application")
        print("═" * 54)
        sys.stdout.flush()

    def get_command_args(self, command: str) -> List[str]:
        """Get arguments for a command from user input.

        Args:
            command: Command name

        Returns:
            List of arguments
        """
        args = []

        if command == "add":
            title = input("Enter task title: ").strip()
            description = input("Enter task description (optional): ").strip()
            args = [title, description] if description else [title]

        elif command == "update":
            task_id = input("Enter task ID: ").strip()
            print("\nWhat would you like to update?")
            print("1. Title only")
            print("2. Description only")
            print("3. Both title and description")
            choice = input("Select option (1-3): ").strip()

            args = [task_id]
            if choice in ("1", "3"):
                title = input("Enter new title: ").strip()
                args.extend(["--title", title])
            if choice in ("2", "3"):
                description = input("Enter new description: ").strip()
                args.extend(["--description", description])

        elif command in ("delete", "complete", "uncomplete"):
            task_id = input("Enter task ID: ").strip()
            args = [task_id]

        return args

    def display_goodbye(self) -> None:
        """Display goodbye message."""
        print("\n╔════════════════════════════════════════════════════╗")
        print("║          Thanks for using Todo CLI!                ║")
        print("╚════════════════════════════════════════════════════╝")
        print("\nAll data has been cleared from memory.")
        print("Goodbye!")

    def display_error(self, message: str) -> None:
        """Display error message.

        Args:
            message: Error message
        """
        print(f"\n✗ Error: {message}")

    def display_success(self, message: str) -> None:
        """Display success message.

        Args:
            message: Success message
        """
        print(f"\n✓ {message}")

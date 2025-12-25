# Todo CLI - Phase 1: In-Memory Task Manager

A clean, beginner-friendly command-line todo application built with Python 3.13+ following Clean Architecture principles. This is Phase 1 of a multi-phase project demonstrating professional software design patterns in a simple, educational context.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Available Commands](#available-commands)
- [Phase 1 Scope](#phase-1-scope)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Future Phases](#future-phases)
- [Contributing](#contributing)

---

## Overview

Todo CLI is a terminal-based task management application designed to demonstrate clean code principles and architectural patterns while remaining accessible to beginners. The application provides a simple, intuitive interface for managing daily tasks entirely in memory.

**Key Highlights:**
- Clean Architecture implementation
- 100% Python standard library (no external dependencies)
- Beginner-friendly codebase
- Professional error handling
- Interactive CLI experience

---

## Features

- **Create Tasks**: Add tasks with titles and optional descriptions
- **List Tasks**: View all tasks in a formatted table
- **Update Tasks**: Modify task titles and descriptions
- **Delete Tasks**: Remove tasks you no longer need
- **Task Status**: Mark tasks as completed or pending
- **Command Aliases**: Multiple ways to invoke commands (e.g., `ls`, `list`, `all`)
- **Input Validation**: Comprehensive validation with helpful error messages
- **Beautiful Output**: Formatted tables and clear success/error messages

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.13+ | Programming language |
| **UV** | Latest | Package and project management |
| **typing** | stdlib | Type hints for code quality |
| **dataclasses** | stdlib | Simplified entity classes |
| **enum** | stdlib | Task status enumeration |
| **datetime** | stdlib | Timestamp handling |
| **abc** | stdlib | Abstract base classes |

**No External Dependencies** - This project uses only Python's standard library to keep it simple and accessible.

---

## Architecture

This project follows **Clean Architecture** (Hexagonal Architecture) with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│              (CLI Interface & Handlers)                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│              (Use Cases & Business Logic)                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                          │
│              (Entities & Business Rules)                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                     │
│              (In-Memory Data Storage)                    │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- Easy to test (isolated business logic)
- Easy to extend (add new storage in future phases)
- Easy to understand (clear responsibilities)
- Beginner-friendly (follows SOLID principles)

---

## Setup Instructions

### Prerequisites

- Python 3.13 or higher
- UV package manager ([Installation Guide](https://github.com/astral-sh/uv))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-cli-phase1
   ```

2. **Install UV** (if not already installed)
   ```bash
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Windows
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

3. **Set up the project** (Optional - no dependencies needed)
   ```bash
   uv sync
   ```

---

## Usage

### Running the Application

Navigate to the `src` directory and run:

```bash
cd src
python3 main.py
```

Or using UV:

```bash
cd src
uv run python main.py
```

### First-Time User Experience

```
╔════════════════════════════════════════════════════╗
║            Welcome to Todo CLI v1.0!               ║
║        Your simple in-memory task manager          ║
╚════════════════════════════════════════════════════╝

Type 'help' to see available commands.
Type 'exit' to quit.

todo>
```

---

## Available Commands

### Basic Commands

| Command | Aliases | Description | Example |
|---------|---------|-------------|---------|
| `add` | `create`, `new` | Create a new task | `add "Buy milk" "From store"` |
| `list` | `ls`, `all` | Display all tasks | `list` |
| `update` | `edit`, `modify` | Update a task | `update 1 --title "New title"` |
| `delete` | `remove`, `rm` | Delete a task | `delete 1` |
| `complete` | `done`, `finish` | Mark task as completed | `complete 1` |
| `uncomplete` | `incomplete`, `undo` | Mark task as pending | `uncomplete 1` |
| `help` | `?`, `h` | Show help message | `help` |
| `exit` | `quit`, `q` | Exit application | `exit` |

### Detailed Command Usage

#### Add a Task
```bash
todo> add "Buy groceries" "Milk, eggs, bread"
✓ Task created successfully!

  ID: 1
  Title: Buy groceries
  Description: Milk, eggs, bread
  Status: pending
  Created: 2025-12-26 14:30:45
```

#### List All Tasks
```bash
todo> list

┌────┬────────────────────┬──────────────────────┬───────────┐
│ ID │ Title              │ Description          │ Status    │
├────┼────────────────────┼──────────────────────┼───────────┤
│ 1  │ Buy groceries      │ Milk, eggs, bread    │ pending   │
│ 2  │ Call dentist       │                      │ pending   │
│ 3  │ Finish report      │ Q4 sales analysis    │ completed │
└────┴────────────────────┴──────────────────────┴───────────┘

Total: 3 tasks (2 pending, 1 completed)
```

#### Update a Task
```bash
todo> update 1 --title "Buy groceries and supplies"
✓ Task 1 updated successfully!

todo> update 1 --description "Milk, eggs, bread, and cleaning supplies"
✓ Task 1 updated successfully!

todo> update 1 --title "Shopping" --description "Weekly groceries"
✓ Task 1 updated successfully!
```

#### Complete a Task
```bash
todo> complete 1
✓ Task 1 marked as completed!

  Title: Buy groceries
  Status: completed
```

#### Delete a Task
```bash
todo> delete 1
✓ Task 1 deleted successfully!
```

---

## Phase 1 Scope

### What's Included ✅

- **Core CRUD Operations**: Create, Read, Update, Delete tasks
- **Task Status Management**: Mark tasks as completed or pending
- **In-Memory Storage**: Fast, simple dictionary-based storage
- **Clean Architecture**: Proper layer separation for future extensibility
- **CLI Interface**: Interactive command-line experience
- **Input Validation**: Comprehensive validation with helpful error messages
- **Command Aliases**: Multiple ways to invoke commands
- **Beautiful Formatting**: Tables and formatted output

### What's NOT Included ❌

- File persistence (coming in Phase 2)
- Database storage (coming in Phase 3)
- Task prioritization
- Due dates or reminders
- Task categories or tags
- Search and filtering
- Multi-user support
- Web interface
- Task dependencies

### Why In-Memory Only?

Phase 1 focuses on:
1. **Learning Clean Architecture** without infrastructure complexity
2. **Building a solid foundation** for future phases
3. **Keeping it simple** for educational purposes
4. **Fast iteration** during development

**Important:** All data is lost when you exit the application. This is intentional for Phase 1.

---

## Project Structure

```
todo-cli-phase1/
├── README.md                          # This file
├── CLAUDE.md                          # AI assistant documentation
├── specs/                             # Specification documents
│   ├── functional_spec.md            # Functional requirements
│   ├── architecture_spec.md          # Technical architecture
│   └── cli_flow_spec.md              # CLI interaction flows
│
└── src/                              # Source code
    ├── main.py                       # Entry point
    │
    ├── domain/                       # Domain Layer
    │   ├── entities/
    │   │   └── task.py              # Task entity
    │   ├── value_objects/
    │   │   └── task_status.py       # Status enum
    │   └── exceptions.py             # Domain exceptions
    │
    ├── application/                  # Application Layer
    │   ├── interfaces/
    │   │   └── task_repository.py   # Repository interface
    │   └── use_cases/
    │       ├── add_task.py          # Add task use case
    │       ├── list_tasks.py        # List tasks use case
    │       ├── update_task.py       # Update task use case
    │       ├── delete_task.py       # Delete task use case
    │       ├── complete_task.py     # Complete task use case
    │       └── uncomplete_task.py   # Uncomplete task use case
    │
    ├── infrastructure/               # Infrastructure Layer
    │   └── repositories/
    │       └── in_memory_task_repository.py  # In-memory storage
    │
    └── presentation/                 # Presentation Layer
        └── cli/
            ├── cli.py               # CLI interface
            ├── command_handlers.py  # Command handlers
            └── formatters.py        # Output formatters
```

---

## Design Decisions

### Why Clean Architecture?

1. **Testability**: Business logic is isolated and easy to test
2. **Flexibility**: Easy to swap storage implementations
3. **Maintainability**: Clear separation of concerns
4. **Educational**: Demonstrates professional patterns
5. **Scalability**: Prepared for future phases

### Why No External Dependencies?

1. **Simplicity**: Easy to understand and run
2. **Learning**: Focus on architecture, not libraries
3. **Portability**: Runs anywhere Python 3.13+ is installed
4. **Beginner-Friendly**: No complex dependency management

### Why UV for Package Management?

1. **Modern**: Latest Python tooling
2. **Fast**: Faster than pip
3. **Simple**: Easy to use
4. **Professional**: Industry best practice

---

## Future Phases

### Phase 2: File Persistence
- Save tasks to JSON file
- Load tasks on startup
- Data survives application restart
- No changes to domain/application layers (demonstrates Clean Architecture benefits!)

### Phase 3: Database Storage
- SQLite integration
- Proper data persistence
- Query optimization
- Migration support

### Phase 4: Advanced Features
- Task prioritization (high/medium/low)
- Due dates and reminders
- Task categories and tags
- Search and filtering
- Export/Import (JSON, CSV)

---

## Example Session

Here's a complete example of using Todo CLI:

```bash
$ cd src && python3 main.py

╔════════════════════════════════════════════════════╗
║            Welcome to Todo CLI v1.0!               ║
║        Your simple in-memory task manager          ║
╚════════════════════════════════════════════════════╝

Type 'help' to see available commands.
Type 'exit' to quit.

todo> add "Buy groceries" "Milk, eggs, bread"
✓ Task created successfully!

  ID: 1
  Title: Buy groceries
  Description: Milk, eggs, bread
  Status: pending
  Created: 2025-12-26 14:30:45

todo> add "Call dentist"
✓ Task created successfully!

  ID: 2
  Title: Call dentist
  Description:
  Status: pending
  Created: 2025-12-26 14:31:12

todo> list

┌────┬────────────────────┬──────────────────────┬───────────┐
│ ID │ Title              │ Description          │ Status    │
├────┼────────────────────┼──────────────────────┼───────────┤
│ 1  │ Buy groceries      │ Milk, eggs, bread    │ pending   │
│ 2  │ Call dentist       │                      │ pending   │
└────┴────────────────────┴──────────────────────┴───────────┘

Total: 2 tasks (2 pending, 0 completed)

todo> complete 1
✓ Task 1 marked as completed!

  Title: Buy groceries
  Status: completed

todo> exit

╔════════════════════════════════════════════════════╗
║          Thanks for using Todo CLI!                ║
╚════════════════════════════════════════════════════╝

All data has been cleared from memory.
Goodbye!
```

---

## Error Handling Examples

The application provides helpful error messages:

```bash
# Missing title
todo> add
✗ Error: Title is required
  Use: add <title> [description]

# Invalid task ID
todo> delete abc
✗ Error: Invalid task ID 'abc'
  Task ID must be a number

# Task not found
todo> update 999 --title "New"
✗ Error: Task with ID 999 not found
  Use 'list' to see available tasks

# Unknown command
todo> invalidcommand
✗ Error: Unknown command 'invalidcommand'

Available commands: add, complete, delete, help, list, uncomplete, update
Type 'help' for more information
```

---

## Contributing

This is an educational project demonstrating Clean Architecture principles. Contributions are welcome!

### Guidelines

1. Follow the existing architecture patterns
2. Maintain beginner-friendly code
3. Add docstrings to all public methods
4. Keep it simple (no unnecessary complexity)
5. Test your changes manually

### Running Tests

Tests will be added in future phases. For now, manually test all commands.

---

## License

MIT License - Feel free to use this project for learning and educational purposes.

---

## Acknowledgments

- Built following Clean Architecture principles by Robert C. Martin
- Designed for hackathon demonstration and educational purposes
- Created with ❤️ for the developer community

---

## Questions or Feedback?

For questions, suggestions, or feedback, please open an issue in the repository.

**Happy Task Managing!** 🎯

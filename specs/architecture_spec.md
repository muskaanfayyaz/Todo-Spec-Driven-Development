# Technical Architecture Specification: Phase 1 In-Memory Todo CLI

**Version:** 1.0  
**Date:** December 26, 2025  
**Status:** Draft  
**Target Audience:** Developers, Technical Leads

---

## 1. Architecture Overview

### 1.1 Architecture Pattern

This application follows **Clean Architecture** principles (also known as Hexagonal Architecture or Ports and Adapters), which emphasizes:

- **Separation of Concerns:** Each layer has a distinct responsibility
- **Dependency Rule:** Dependencies point inward; inner layers know nothing about outer layers
- **Testability:** Business logic isolated from external concerns
- **Flexibility:** Easy to swap implementations (e.g., storage, UI)

### 1.2 Layer Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (CLI Interface & Controllers)               │
│                   cli.py, commands.py                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│              (Use Cases & Business Logic)                │
│                   use_cases/ folder                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│              (Core Business Entities & Rules)            │
│               entities/, value_objects/                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                    │
│              (External Interfaces & Storage)             │
│                repositories/, storage/                   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Layer Specifications

### 2.1 Domain Layer (Core)

**Purpose:** Contains the core business entities and rules. No dependencies on other layers.

**Components:**

**Task Entity** (`domain/entities/task.py`)
```python
Attributes:
- id: int (immutable, unique)
- title: str (1-200 chars)
- description: str (0-1000 chars)
- status: TaskStatus (enum)
- created_at: datetime (immutable)

Methods:
- __init__(): Constructor with validation
- complete(): Marks task as completed
- uncomplete(): Marks task as pending
- update_title(title: str): Updates title with validation
- update_description(desc: str): Updates description with validation
- __repr__(): String representation
```

**Task Status Value Object** (`domain/value_objects/task_status.py`)
```python
Enum:
- PENDING = "pending"
- COMPLETED = "completed"

Methods:
- is_completed(): Returns bool
- is_pending(): Returns bool
```

**Domain Exceptions** (`domain/exceptions.py`)
```python
Exceptions:
- TaskValidationError: Raised for invalid task data
- TaskNotFoundError: Raised when task ID doesn't exist
- InvalidCommandError: Raised for malformed commands
```

### 2.2 Application Layer (Use Cases)

**Purpose:** Implements business logic and orchestrates data flow. Depends only on Domain layer.

**Use Cases:**

1. **AddTaskUseCase** (`application/use_cases/add_task.py`)
   - Input: title (str), description (str, optional)
   - Output: Task entity
   - Responsibility: Create and store new task

2. **ListTasksUseCase** (`application/use_cases/list_tasks.py`)
   - Input: None
   - Output: List[Task]
   - Responsibility: Retrieve all tasks

3. **UpdateTaskUseCase** (`application/use_cases/update_task.py`)
   - Input: task_id (int), title (str, optional), description (str, optional)
   - Output: Task entity
   - Responsibility: Update existing task

4. **DeleteTaskUseCase** (`application/use_cases/delete_task.py`)
   - Input: task_id (int)
   - Output: bool (success)
   - Responsibility: Remove task from storage

5. **CompleteTaskUseCase** (`application/use_cases/complete_task.py`)
   - Input: task_id (int)
   - Output: Task entity
   - Responsibility: Mark task as completed

6. **UncompleteTaskUseCase** (`application/use_cases/uncomplete_task.py`)
   - Input: task_id (int)
   - Output: Task entity
   - Responsibility: Mark task as pending

**Repository Interface** (`application/interfaces/task_repository.py`)
```python
Abstract Base Class:
- add(task: Task) -> Task
- get_by_id(task_id: int) -> Optional[Task]
- get_all() -> List[Task]
- update(task: Task) -> Task
- delete(task_id: int) -> bool
- exists(task_id: int) -> bool
- get_next_id() -> int
```

### 2.3 Infrastructure Layer

**Purpose:** Implements external interfaces and storage mechanisms. Depends on Application and Domain layers.

**In-Memory Repository** (`infrastructure/repositories/in_memory_task_repository.py`)
```python
Implements: TaskRepository interface

Internal Structure:
- _tasks: Dict[int, Task] (storage dictionary)
- _next_id: int (ID counter)

Methods:
- Implements all TaskRepository interface methods
- Thread-safe operations (not required for Phase 1, but good practice)
```

### 2.4 Presentation Layer

**Purpose:** Handles user interaction and input/output. Depends on Application layer.

**CLI Interface** (`presentation/cli/cli.py`)
```python
Responsibilities:
- Display welcome message
- Show command prompt
- Parse user input
- Route commands to appropriate handlers
- Display results and errors
- Handle application lifecycle

Components:
- main_loop(): Primary REPL loop
- parse_command(input: str): Parse user input into command and args
- display_tasks(tasks: List[Task]): Format and display task list
- display_error(error: Exception): Show error messages
- display_success(message: str): Show success messages
```

**Command Handlers** (`presentation/cli/command_handlers.py`)
```python
Classes:
- AddTaskHandler: Handles 'add' command
- ListTasksHandler: Handles 'list' command
- UpdateTaskHandler: Handles 'update' command
- DeleteTaskHandler: Handles 'delete' command
- CompleteTaskHandler: Handles 'complete' command
- UncompleteTaskHandler: Handles 'uncomplete' command
- HelpHandler: Handles 'help' command
- ExitHandler: Handles 'exit' command

Each Handler:
- execute(args): Process command with arguments
- validate(args): Validate input before execution
- format_output(result): Format result for display
```

**Display Formatters** (`presentation/cli/formatters.py`)
```python
Functions:
- format_task_list(tasks: List[Task]) -> str: Table formatting
- format_task_detail(task: Task) -> str: Single task display
- truncate_text(text: str, max_length: int) -> str: Text truncation
```

---

## 3. Project Structure

```
todo-cli/
├── pyproject.toml                 # UV project configuration
├── README.md                      # Setup and usage instructions
├── CLAUDE.md                      # AI assistant usage documentation
├── specs/                         # Specification documents
│   ├── 01-FUNCTIONAL-SPEC.md
│   ├── 02-TECHNICAL-SPEC.md
│   └── 03-CLI-FLOW-SPEC.md
├── src/
│   └── todo_cli/
│       ├── __init__.py
│       ├── __main__.py           # Entry point
│       │
│       ├── domain/               # Domain Layer
│       │   ├── __init__.py
│       │   ├── entities/
│       │   │   ├── __init__.py
│       │   │   └── task.py
│       │   ├── value_objects/
│       │   │   ├── __init__.py
│       │   │   └── task_status.py
│       │   └── exceptions.py
│       │
│       ├── application/          # Application Layer
│       │   ├── __init__.py
│       │   ├── interfaces/
│       │   │   ├── __init__.py
│       │   │   └── task_repository.py
│       │   └── use_cases/
│       │       ├── __init__.py
│       │       ├── add_task.py
│       │       ├── list_tasks.py
│       │       ├── update_task.py
│       │       ├── delete_task.py
│       │       ├── complete_task.py
│       │       └── uncomplete_task.py
│       │
│       ├── infrastructure/       # Infrastructure Layer
│       │   ├── __init__.py
│       │   └── repositories/
│       │       ├── __init__.py
│       │       └── in_memory_task_repository.py
│       │
│       └── presentation/         # Presentation Layer
│           ├── __init__.py
│           └── cli/
│               ├── __init__.py
│               ├── cli.py
│               ├── command_handlers.py
│               └── formatters.py
│
└── tests/                        # Test suite (future)
    ├── __init__.py
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 4. Data Flow

### 4.1 Add Task Flow

```
User Input: "add 'Buy milk' 'From the store'"
    │
    ▼
CLI (parse_command)
    │
    ▼
AddTaskHandler (validate & extract args)
    │
    ▼
AddTaskUseCase (business logic)
    │
    ▼
InMemoryTaskRepository (generate ID, store)
    │
    ▼
Task Entity (created)
    │
    ▼
AddTaskHandler (format output)
    │
    ▼
CLI (display success)
    │
    ▼
User Output: "✓ Task created with ID: 1"
```

### 4.2 Update Task Flow

```
User Input: "update 1 --title 'Buy groceries'"
    │
    ▼
CLI (parse_command)
    │
    ▼
UpdateTaskHandler (validate & extract args)
    │
    ▼
UpdateTaskUseCase (business logic)
    │
    ├─▶ Repository (get task by ID)
    │   └─▶ Task found or TaskNotFoundError
    │
    ├─▶ Task Entity (update_title method)
    │   └─▶ Validation occurs
    │
    └─▶ Repository (update task)
        └─▶ Task updated
    │
    ▼
UpdateTaskHandler (format output)
    │
    ▼
CLI (display success)
    │
    ▼
User Output: "✓ Task 1 updated"
```

---

## 5. Technology Stack

### 5.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.13+ | Programming language |
| UV | Latest | Package & project management |
| typing | stdlib | Type hints for better code quality |
| dataclasses | stdlib | Simplified entity classes |
| enum | stdlib | Task status enumeration |
| datetime | stdlib | Timestamp handling |
| abc | stdlib | Abstract base classes for interfaces |

### 5.2 Development Tools

| Tool | Purpose |
|------|---------|
| UV | Dependency management |
| Black | Code formatting (optional) |
| Ruff | Linting (optional) |
| MyPy | Type checking (optional) |

### 5.3 No External Dependencies

- **Phase 1 uses only Python standard library**
- No third-party packages required
- Keeps the project simple and beginner-friendly

---

## 6. Design Patterns

### 6.1 Repository Pattern

**Purpose:** Abstract data access logic

**Implementation:**
- Interface defined in Application layer
- Concrete implementation in Infrastructure layer
- Use cases depend on interface, not implementation

**Benefits:**
- Easy to swap storage (e.g., in-memory → file → database)
- Testable with mock repositories
- Business logic independent of storage

### 6.2 Use Case Pattern

**Purpose:** Encapsulate business operations

**Implementation:**
- One use case per business operation
- Single Responsibility Principle
- Clear inputs and outputs

**Benefits:**
- Easy to understand
- Easy to test
- Easy to modify

### 6.3 Command Pattern (Simplified)

**Purpose:** Encapsulate command execution

**Implementation:**
- Each command has a handler
- Handlers validate, execute, and format
- CLI routes to appropriate handler

**Benefits:**
- Separation of parsing from execution
- Easy to add new commands
- Consistent command structure

### 6.4 Value Object Pattern

**Purpose:** Represent domain concepts without identity

**Implementation:**
- TaskStatus enum
- Immutable
- Validation on creation

**Benefits:**
- Type safety
- Clear domain language
- Prevents invalid states

---

## 7. Error Handling Strategy

### 7.1 Exception Hierarchy

```
Exception
└── TodoAppException (base)
    ├── DomainException
    │   ├── TaskValidationError
    │   └── InvalidTaskDataError
    ├── ApplicationException
    │   └── TaskNotFoundError
    └── PresentationException
        └── InvalidCommandError
```

### 7.2 Error Handling Flow

1. **Domain Layer:** Raises validation errors
2. **Application Layer:** Catches domain errors, may raise not-found errors
3. **Presentation Layer:** Catches all errors, formats for display
4. **Never crash:** All exceptions caught and displayed gracefully

### 7.3 Error Message Guidelines

- Clear and specific
- Suggest corrective action when possible
- Use consistent format
- No technical jargon in user-facing messages

---

## 8. Dependency Injection

### 8.1 Strategy

**Manual Constructor Injection:**
- Use cases receive repository via constructor
- Handlers receive use cases via constructor
- CLI receives handlers via constructor

### 8.2 Composition Root

**Location:** `src/todo_cli/__main__.py`

**Responsibilities:**
1. Create repository instance
2. Create use case instances with repository
3. Create handler instances with use cases
4. Create CLI instance with handlers
5. Start application

**Example:**
```python
# Repository
repository = InMemoryTaskRepository()

# Use Cases
add_task_uc = AddTaskUseCase(repository)
list_tasks_uc = ListTasksUseCase(repository)
# ... other use cases

# Handlers
add_handler = AddTaskHandler(add_task_uc)
list_handler = ListTasksHandler(list_tasks_uc)
# ... other handlers

# CLI
cli = TodoCLI(handlers)
cli.run()
```

---

## 9. Memory Management

### 9.1 Storage Structure

**Primary Storage:** `Dict[int, Task]`
- Key: Task ID (int)
- Value: Task entity
- O(1) lookup, update, delete
- O(n) list all tasks

### 9.2 ID Generation

**Strategy:** Sequential counter
- Start at 1
- Increment on each add
- Never reuse IDs in same session
- Reset on application restart

### 9.3 Memory Constraints

- Expected: < 1000 tasks per session
- Average task size: ~500 bytes
- Total memory: < 1 MB for task data
- No memory optimization needed for Phase 1

---

## 10. Type System

### 10.1 Type Hints

**All public interfaces must have type hints:**
```python
def add_task(title: str, description: str = "") -> Task:
    ...

def get_task_by_id(task_id: int) -> Optional[Task]:
    ...
```

### 10.2 Type Checking

**Optional but recommended:**
- Run `mypy` for static type checking
- Helps catch errors early
- Improves IDE support

---

## 11. Code Quality Standards

### 11.1 Naming Conventions

**Files:** snake_case (e.g., `task_repository.py`)
**Classes:** PascalCase (e.g., `AddTaskUseCase`)
**Functions/Methods:** snake_case (e.g., `get_all_tasks`)
**Constants:** UPPER_SNAKE_CASE (e.g., `MAX_TITLE_LENGTH`)
**Private:** Prefix with `_` (e.g., `_next_id`)

### 11.2 Documentation

**Module level:** Brief description of purpose
**Class level:** What it represents, key responsibilities
**Public methods:** Docstring with args, returns, raises
**Complex logic:** Inline comments

### 11.3 Code Style

**Line length:** Max 88 characters (Black default)
**Imports:** Grouped (stdlib, third-party, local)
**Blank lines:** 2 before classes, 1 before methods

---

## 12. Testing Strategy (Future)

### 12.1 Test Pyramid

**Unit Tests:**
- Domain entities
- Value objects
- Use cases with mock repository

**Integration Tests:**
- Repository implementations
- Handler + use case integration

**End-to-End Tests:**
- Full command execution
- CLI interaction simulation

### 12.2 Test Coverage Goals

- Domain layer: 100%
- Application layer: 95%+
- Infrastructure layer: 90%+
- Presentation layer: 80%+

---

## 13. Performance Considerations

### 13.1 Expected Performance

| Operation | Time Complexity | Expected Time |
|-----------|----------------|---------------|
| Add Task | O(1) | < 1ms |
| Get by ID | O(1) | < 1ms |
| List All | O(n) | < 10ms for 1000 tasks |
| Update | O(1) | < 1ms |
| Delete | O(1) | < 1ms |

### 13.2 No Optimization Needed

- In-memory operations are fast enough
- No indexing required
- No caching needed
- Focus on code clarity over performance

---

## 14. Security Considerations

### 14.1 Input Validation

- Validate all user input at presentation layer
- Validate business rules at domain layer
- Prevent injection attacks (though CLI is safe)
- Limit string lengths to prevent memory issues

### 14.2 No Sensitive Data

- Phase 1 has no authentication
- No sensitive data stored
- No network communication
- No file system access

---

## 15. Deployment

### 15.1 Installation

```bash
# Clone repository
git clone <repo-url>
cd todo-cli

# Install with UV
uv sync

# Run application
uv run python -m todo_cli
```

### 15.2 Distribution

- Distribute as source code
- Users run with UV
- No compilation needed
- Cross-platform (Windows, macOS, Linux)

---

## 16. Migration Path (Future Phases)

### 16.1 Phase 2: File Persistence

**Changes required:**
1. Add `FileTaskRepository` in infrastructure
2. No changes to domain or application layers
3. Minor changes to composition root
4. Add configuration for file path

### 16.2 Phase 3: Database

**Changes required:**
1. Add `DatabaseTaskRepository` in infrastructure
2. Add database models
3. No changes to domain or application layers
4. Add database configuration

**Clean Architecture enables this flexibility!**

---

## 17. Glossary

- **Entity:** Object with identity (e.g., Task)
- **Value Object:** Object without identity (e.g., TaskStatus)
- **Use Case:** Single business operation
- **Repository:** Abstraction for data access
- **Dependency Injection:** Passing dependencies to constructors
- **Composition Root:** Where dependencies are wired together

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-26 | System | Initial draft |

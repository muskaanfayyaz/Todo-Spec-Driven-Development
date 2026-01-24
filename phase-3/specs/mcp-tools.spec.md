# MCP Tools Specification

**Spec ID:** SPEC-P3-MCP-001
**Status:** SPECIFY Stage - Awaiting Approval
**Constitution Reference:** Article V (MCP + Agent Enforcement Rules)

---

## 1. Overview

### 1.1 Purpose

MCP Tools provide a standardized interface for the AI agent to perform task operations. Each tool wraps a Phase II use case, ensuring all task logic flows through the existing, validated business layer.

### 1.2 Governing Principles

| Principle | Enforcement |
|-----------|-------------|
| Phase II Delegation | Every tool delegates to a Phase II use case |
| No Direct DB Writes | Tools NEVER write to DB directly |
| User Scoping | Every tool receives and enforces user_id |
| Stateless Tools | Tools hold no state between invocations |

---

## 2. Technology Stack

| Component | Technology |
|-----------|------------|
| MCP SDK | Official MCP Python SDK (`mcp`) |
| Transport | In-process function calls |
| Schema | JSON Schema for parameters |

---

## 3. Tool Registry

### 3.1 Tool Inventory

| Tool Name | Phase II Use Case | Operation |
|-----------|-------------------|-----------|
| `add_task` | `AddTaskUseCase` | Create |
| `list_tasks` | `ListTasksUseCase` | Read |
| `complete_task` | `CompleteTaskUseCase` | Update |
| `delete_task` | `DeleteTaskUseCase` | Delete |
| `update_task` | `UpdateTaskUseCase` | Update |

### 3.2 Tool-to-UseCase Mapping Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MCP TOOLS LAYER                                   │
│                                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │ add_task  │ │list_tasks │ │complete_  │ │delete_task│ │update_task│     │
│  │           │ │           │ │   task    │ │           │ │           │     │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘     │
│        │             │             │             │             │           │
├────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────┤
│        │             │             │             │             │           │
│        ▼             ▼             ▼             ▼             ▼           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PHASE II USE CASES (IMMUTABLE)                   │   │
│  │                                                                     │   │
│  │  AddTaskUseCase  ListTasksUseCase  CompleteTaskUseCase              │   │
│  │                                                                     │   │
│  │  DeleteTaskUseCase               UpdateTaskUseCase                  │   │
│  │                                                                     │   │
│  └─────────────────────────────────┬───────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              PHASE II REPOSITORY (IMMUTABLE)                        │   │
│  │                                                                     │   │
│  │              PostgreSQLTaskRepository(session, user_id)             │   │
│  │                                                                     │   │
│  └─────────────────────────────────┬───────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PHASE II DATABASE (IMMUTABLE)                    │   │
│  │                                                                     │   │
│  │                           task table                                │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tool Definitions

### 4.1 Tool: `add_task`

#### 4.1.1 Metadata

| Attribute | Value |
|-----------|-------|
| Name | `add_task` |
| Description | Create a new task for the user |
| Phase II Delegate | `AddTaskUseCase.execute(title, description)` |

#### 4.1.2 Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `user_id` | string | Yes | Authenticated user ID | Injected by agent layer |
| `title` | string | Yes | Task title | 1-200 characters |
| `description` | string | No | Task description | 0-1000 characters |

#### 4.1.3 JSON Schema

```json
{
  "name": "add_task",
  "description": "Create a new task for the user",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID"
      },
      "title": {
        "type": "string",
        "description": "The task title (1-200 characters)",
        "minLength": 1,
        "maxLength": 200
      },
      "description": {
        "type": "string",
        "description": "Optional task description (max 1000 characters)",
        "maxLength": 1000
      }
    },
    "required": ["user_id", "title"]
  }
}
```

#### 4.1.4 Return Schema

```json
{
  "type": "object",
  "properties": {
    "task_id": { "type": "integer" },
    "status": { "type": "string", "enum": ["created"] },
    "title": { "type": "string" }
  }
}
```

#### 4.1.5 Execution Flow

```
add_task(user_id, title, description)
    │
    ├─► Acquire database session: get_session()
    │
    ├─► Instantiate repository: PostgreSQLTaskRepository(session, user_id)
    │
    ├─► Instantiate use case: AddTaskUseCase(repository)
    │
    ├─► Execute: task = use_case.execute(title, description)
    │
    ├─► Return: { task_id: task.id, status: "created", title: task.title }
    │
    └─► Session closed (scoped to request)
```

#### 4.1.6 Error Responses

| Condition | Response |
|-----------|----------|
| Title empty | `{ "error": "Title is required" }` |
| Title too long | `{ "error": "Title must be 200 characters or less" }` |
| Description too long | `{ "error": "Description must be 1000 characters or less" }` |
| Database error | `{ "error": "Failed to create task" }` |

---

### 4.2 Tool: `list_tasks`

#### 4.2.1 Metadata

| Attribute | Value |
|-----------|-------|
| Name | `list_tasks` |
| Description | Retrieve user's tasks with optional status filter |
| Phase II Delegate | `ListTasksUseCase.execute()` |

#### 4.2.2 Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `user_id` | string | Yes | Authenticated user ID | Injected by agent layer |
| `status` | string | No | Filter: "all", "pending", "completed" | Default: "all" |

#### 4.2.3 JSON Schema

```json
{
  "name": "list_tasks",
  "description": "Retrieve user's tasks with optional status filter",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID"
      },
      "status": {
        "type": "string",
        "description": "Filter tasks by status",
        "enum": ["all", "pending", "completed"],
        "default": "all"
      }
    },
    "required": ["user_id"]
  }
}
```

#### 4.2.4 Return Schema

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "integer" },
      "title": { "type": "string" },
      "description": { "type": "string", "nullable": true },
      "completed": { "type": "boolean" }
    }
  }
}
```

#### 4.2.5 Execution Flow

```
list_tasks(user_id, status="all")
    │
    ├─► Acquire database session: get_session()
    │
    ├─► Instantiate repository: PostgreSQLTaskRepository(session, user_id)
    │
    ├─► Instantiate use case: ListTasksUseCase(repository)
    │
    ├─► Execute: tasks = use_case.execute()
    │
    ├─► Apply filter (Phase III logic):
    │       if status == "pending": filter(not completed)
    │       if status == "completed": filter(completed)
    │
    ├─► Return: [{ id, title, description, completed }, ...]
    │
    └─► Session closed
```

#### 4.2.6 Empty Result

If no tasks match:
```json
[]
```

---

### 4.3 Tool: `complete_task`

#### 4.3.1 Metadata

| Attribute | Value |
|-----------|-------|
| Name | `complete_task` |
| Description | Mark a task as completed |
| Phase II Delegate | `CompleteTaskUseCase.execute(task_id)` |

#### 4.3.2 Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | Authenticated user ID |
| `task_id` | integer | Yes | ID of task to complete |

#### 4.3.3 JSON Schema

```json
{
  "name": "complete_task",
  "description": "Mark a task as completed",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID"
      },
      "task_id": {
        "type": "integer",
        "description": "The ID of the task to complete"
      }
    },
    "required": ["user_id", "task_id"]
  }
}
```

#### 4.3.4 Return Schema

```json
{
  "type": "object",
  "properties": {
    "task_id": { "type": "integer" },
    "status": { "type": "string", "enum": ["completed"] },
    "title": { "type": "string" }
  }
}
```

#### 4.3.5 Execution Flow

```
complete_task(user_id, task_id)
    │
    ├─► Acquire database session: get_session()
    │
    ├─► Instantiate repository: PostgreSQLTaskRepository(session, user_id)
    │
    ├─► Instantiate use case: CompleteTaskUseCase(repository)
    │
    ├─► Execute: task = use_case.execute(task_id)
    │       └─► Phase II handles: task not found, already completed, etc.
    │
    ├─► Return: { task_id: task.id, status: "completed", title: task.title }
    │
    └─► Session closed
```

#### 4.3.6 Error Responses

| Condition | Response |
|-----------|----------|
| Task not found | `{ "error": "Task not found", "task_id": <id> }` |
| Task belongs to another user | `{ "error": "Task not found", "task_id": <id> }` |

**Note:** Security by obscurity - same error for "not found" and "not yours".

---

### 4.4 Tool: `delete_task`

#### 4.4.1 Metadata

| Attribute | Value |
|-----------|-------|
| Name | `delete_task` |
| Description | Permanently remove a task |
| Phase II Delegate | `DeleteTaskUseCase.execute(task_id)` |

#### 4.4.2 Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | Authenticated user ID |
| `task_id` | integer | Yes | ID of task to delete |

#### 4.4.3 JSON Schema

```json
{
  "name": "delete_task",
  "description": "Permanently remove a task",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID"
      },
      "task_id": {
        "type": "integer",
        "description": "The ID of the task to delete"
      }
    },
    "required": ["user_id", "task_id"]
  }
}
```

#### 4.4.4 Return Schema

```json
{
  "type": "object",
  "properties": {
    "task_id": { "type": "integer" },
    "status": { "type": "string", "enum": ["deleted"] },
    "title": { "type": "string" }
  }
}
```

#### 4.4.5 Execution Flow

```
delete_task(user_id, task_id)
    │
    ├─► Acquire database session: get_session()
    │
    ├─► Instantiate repository: PostgreSQLTaskRepository(session, user_id)
    │
    ├─► Fetch task first (for title in response): repository.get_by_id(task_id)
    │
    ├─► Instantiate use case: DeleteTaskUseCase(repository)
    │
    ├─► Execute: use_case.execute(task_id)
    │
    ├─► Return: { task_id, status: "deleted", title }
    │
    └─► Session closed
```

#### 4.4.6 Error Responses

| Condition | Response |
|-----------|----------|
| Task not found | `{ "error": "Task not found", "task_id": <id> }` |

---

### 4.5 Tool: `update_task`

#### 4.5.1 Metadata

| Attribute | Value |
|-----------|-------|
| Name | `update_task` |
| Description | Modify a task's title or description |
| Phase II Delegate | `UpdateTaskUseCase.execute(task_id, title, description)` |

#### 4.5.2 Parameters

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `user_id` | string | Yes | Authenticated user ID | Injected |
| `task_id` | integer | Yes | ID of task to update | Must exist |
| `title` | string | No | New title | 1-200 chars if provided |
| `description` | string | No | New description | 0-1000 chars if provided |

**Constraint:** At least one of `title` or `description` must be provided.

#### 4.5.3 JSON Schema

```json
{
  "name": "update_task",
  "description": "Modify a task's title or description",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated user's ID"
      },
      "task_id": {
        "type": "integer",
        "description": "The ID of the task to update"
      },
      "title": {
        "type": "string",
        "description": "New task title (1-200 characters)",
        "minLength": 1,
        "maxLength": 200
      },
      "description": {
        "type": "string",
        "description": "New task description (max 1000 characters)",
        "maxLength": 1000
      }
    },
    "required": ["user_id", "task_id"]
  }
}
```

#### 4.5.4 Return Schema

```json
{
  "type": "object",
  "properties": {
    "task_id": { "type": "integer" },
    "status": { "type": "string", "enum": ["updated"] },
    "title": { "type": "string" }
  }
}
```

#### 4.5.5 Execution Flow

```
update_task(user_id, task_id, title=None, description=None)
    │
    ├─► Validate: at least one of title/description provided
    │
    ├─► Acquire database session: get_session()
    │
    ├─► Instantiate repository: PostgreSQLTaskRepository(session, user_id)
    │
    ├─► Instantiate use case: UpdateTaskUseCase(repository)
    │
    ├─► Execute: task = use_case.execute(task_id, title, description)
    │
    ├─► Return: { task_id: task.id, status: "updated", title: task.title }
    │
    └─► Session closed
```

#### 4.5.6 Error Responses

| Condition | Response |
|-----------|----------|
| Task not found | `{ "error": "Task not found", "task_id": <id> }` |
| No fields provided | `{ "error": "At least title or description required" }` |
| Title too long | `{ "error": "Title must be 200 characters or less" }` |

---

## 5. Prohibited Patterns

### 5.1 Direct Database Access

```python
# FORBIDDEN - Direct SQL
session.execute("INSERT INTO task ...")

# FORBIDDEN - Direct model creation
task = TaskDB(title="...", user_id="...")
session.add(task)

# FORBIDDEN - Bypassing use case
repository.add(task)  # Without use case wrapper
```

### 5.2 Cross-User Access

```python
# FORBIDDEN - Hardcoded user
repository = PostgreSQLTaskRepository(session, "other_user_id")

# FORBIDDEN - No user scoping
repository = PostgreSQLTaskRepository(session, None)
```

### 5.3 State Retention

```python
# FORBIDDEN - Module-level cache
_task_cache = {}

# FORBIDDEN - Singleton repository
_repository = None
```

---

## 6. Security Enforcement

### 6.1 User Isolation

Every tool call is scoped to `user_id`:

```
Repository construction:
    PostgreSQLTaskRepository(session, user_id)
        │
        └─► ALL queries include: WHERE user_id = :user_id
```

### 6.2 Input Validation

Tools validate before delegating:

| Input | Validation | Fail Response |
|-------|------------|---------------|
| `user_id` | Non-empty string | 400 Bad Request |
| `task_id` | Positive integer | `{ error: "Invalid task ID" }` |
| `title` | 1-200 characters | `{ error: "Invalid title length" }` |
| `description` | 0-1000 characters | `{ error: "Description too long" }` |

### 6.3 Error Masking

Never reveal whether a task exists for another user:

```
Task 42 belongs to user_A
User_B calls: delete_task(user_id="user_B", task_id=42)

Response: { "error": "Task not found", "task_id": 42 }
NOT: { "error": "Task belongs to another user" }
```

---

## 7. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-001 | All tools delegate to Phase II use cases | Code review: no direct DB calls |
| AC-002 | Tools are stateless | Repeated calls work independently |
| AC-003 | User isolation enforced | User A cannot affect User B's tasks |
| AC-004 | Input validation works | Invalid inputs return appropriate errors |
| AC-005 | Error responses are consistent | All errors follow defined schema |

---

## Approval Gate

**Awaiting user approval: "MCP tools spec approved"**

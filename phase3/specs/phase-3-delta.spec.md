# Phase III Delta Specification

**Document Type:** Architecture Specification
**Status:** SPECIFY Stage - Awaiting Approval
**Spec ID:** SPEC-P3-DELTA-001
**References:** Constitution Article I, Section 1.1

---

## Executive Summary

Phase III adds an **AI chatbot interface** to the existing Phase II Todo application. This document defines the precise boundary between reused and new components.

**Principle:** Extend, don't rebuild. Phase II is a stable foundation; Phase III adds a conversational layer on top.

---

## Section 1: Reused Components from Phase II

### 1.1 Database Models (REUSE - NO MODIFICATION)

| Model | Location | Phase III Usage |
|-------|----------|-----------------|
| `TaskDB` | `phase2/backend/app/infrastructure/models.py` | Read/Write via MCP tools |
| `UserDB` | `phase2/backend/app/infrastructure/models.py` | Reference for foreign keys |

**Schema (Unchanged):**
```
┌─────────────────────────────────────────────────────────┐
│ task                                                    │
├─────────────────────────────────────────────────────────┤
│ id: INTEGER PRIMARY KEY                                 │
│ user_id: VARCHAR FOREIGN KEY → user.id                  │
│ title: VARCHAR(200) NOT NULL                            │
│ description: VARCHAR(1000) NULLABLE                     │
│ completed: BOOLEAN DEFAULT FALSE                        │
│ created_at: TIMESTAMP                                   │
│ updated_at: TIMESTAMP                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ user (managed by Better Auth)                           │
├─────────────────────────────────────────────────────────┤
│ id: VARCHAR PRIMARY KEY                                 │
│ email: VARCHAR UNIQUE                                   │
│ name: VARCHAR                                           │
│ ... (Better Auth fields)                                │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Authentication System (REUSE - NO MODIFICATION)

| Component | Location | Phase III Usage |
|-----------|----------|-----------------|
| `get_current_user()` | `phase2/backend/app/auth.py` | Dependency injection for chat endpoint |
| JWT Verification | `phase2/backend/app/auth.py` | Validate `Authorization: Bearer` header |
| `BETTER_AUTH_SECRET` | Environment variable | Shared secret for token verification |

**Auth Flow (Unchanged):**
```
Frontend (ChatKit)
    │
    ├─► Better Auth login → JWT issued
    │
    ├─► Chat request with JWT in header
    │
    ▼
Phase III Chat Endpoint
    │
    ├─► get_current_user() validates JWT
    │
    ├─► Extract user_id from token
    │
    ▼
Proceed with authenticated request
```

### 1.3 Task CRUD Logic (REUSE - NO MODIFICATION)

#### 1.3.1 Domain Layer (Immutable)

| Component | Location | Description |
|-----------|----------|-------------|
| `Task` entity | `phase2/backend/app/domain/entities/task.py` | Core task business object |
| `TaskStatus` | `phase2/backend/app/domain/value_objects/task_status.py` | PENDING/COMPLETED enum |
| `TaskValidationError` | `phase2/backend/app/domain/exceptions.py` | Domain exceptions |
| `TaskNotFoundError` | `phase2/backend/app/domain/exceptions.py` | Not found exception |

#### 1.3.2 Application Layer (Immutable)

| Use Case | Location | MCP Tool Mapping |
|----------|----------|------------------|
| `AddTaskUseCase` | `phase2/backend/app/application/use_cases/add_task.py` | `add_task` |
| `ListTasksUseCase` | `phase2/backend/app/application/use_cases/list_tasks.py` | `list_tasks` |
| `UpdateTaskUseCase` | `phase2/backend/app/application/use_cases/update_task.py` | `update_task` |
| `DeleteTaskUseCase` | `phase2/backend/app/application/use_cases/delete_task.py` | `delete_task` |
| `CompleteTaskUseCase` | `phase2/backend/app/application/use_cases/complete_task.py` | `complete_task` |
| `UncompleteTaskUseCase` | `phase2/backend/app/application/use_cases/uncomplete_task.py` | (via `update_task`) |

#### 1.3.3 Infrastructure Layer (Immutable)

| Component | Location | Description |
|-----------|----------|-------------|
| `PostgreSQLTaskRepository` | `phase2/backend/app/infrastructure/repositories/` | User-scoped task persistence |
| `TaskRepository` interface | `phase2/backend/app/application/interfaces/` | Abstract repository contract |

#### 1.3.4 Database Connection (Reused)

| Component | Location | Phase III Usage |
|-----------|----------|-----------------|
| `get_session()` | `phase2/backend/app/database.py` | Dependency for DB sessions |
| `engine` | `phase2/backend/app/database.py` | SQLModel engine (shared) |
| `DATABASE_URL` | Environment variable | Connection string (shared) |

### 1.4 Configuration (REUSE - NO MODIFICATION)

| Config | Location | Phase III Usage |
|--------|----------|-----------------|
| `Settings` | `phase2/backend/app/config.py` | Environment configuration |
| CORS settings | `phase2/backend/app/main.py` | May need extension for ChatKit origin |

---

## Section 2: New Components in Phase III

### 2.1 Database Models (NEW)

#### 2.1.1 Conversation Model

```
┌─────────────────────────────────────────────────────────┐
│ conversation                                            │
├─────────────────────────────────────────────────────────┤
│ id: INTEGER PRIMARY KEY AUTOINCREMENT                   │
│ user_id: VARCHAR NOT NULL                               │
│     FOREIGN KEY → user.id                               │
│ created_at: TIMESTAMP DEFAULT NOW                       │
│ updated_at: TIMESTAMP DEFAULT NOW ON UPDATE             │
├─────────────────────────────────────────────────────────┤
│ INDEX: idx_conversation_user_id (user_id)               │
└─────────────────────────────────────────────────────────┘
```

**Purpose:** Track chat sessions per user. Enables conversation history retrieval.

#### 2.1.2 Message Model

```
┌─────────────────────────────────────────────────────────┐
│ message                                                 │
├─────────────────────────────────────────────────────────┤
│ id: INTEGER PRIMARY KEY AUTOINCREMENT                   │
│ conversation_id: INTEGER NOT NULL                       │
│     FOREIGN KEY → conversation.id ON DELETE CASCADE     │
│ user_id: VARCHAR NOT NULL                               │
│     FOREIGN KEY → user.id                               │
│ role: VARCHAR(20) NOT NULL                              │
│     CHECK (role IN ('user', 'assistant'))               │
│ content: TEXT NOT NULL                                  │
│ tool_calls: JSON NULLABLE                               │
│ created_at: TIMESTAMP DEFAULT NOW                       │
├─────────────────────────────────────────────────────────┤
│ INDEX: idx_message_conversation (conversation_id)       │
│ INDEX: idx_message_created (created_at)                 │
└─────────────────────────────────────────────────────────┘
```

**Purpose:** Store individual messages within conversations. Supports conversation replay for agent context.

#### 2.1.3 Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌─────────┐
│   user   │───┬───│ conversation │───────│ message │
│ (Phase2) │   │   │  (Phase 3)   │  1:N  │(Phase 3)│
└──────────┘   │   └──────────────┘       └─────────┘
               │
               │   ┌──────────┐
               └───│   task   │
                   │ (Phase2) │
                   └──────────┘
```

### 2.2 Chat API Endpoint (NEW)

#### 2.2.1 Endpoint Definition

| Attribute | Value |
|-----------|-------|
| Method | `POST` |
| Path | `/api/{user_id}/chat` |
| Auth | JWT required (via `get_current_user`) |
| Content-Type | `application/json` |

#### 2.2.2 Request Schema

```
ChatRequest {
    conversation_id: INTEGER | null    # Existing conversation or null for new
    message: STRING (required)         # User's natural language input
}
```

**Validation Rules:**
- `message`: Required, 1-2000 characters, trimmed whitespace
- `conversation_id`: Optional, must exist and belong to user if provided

#### 2.2.3 Response Schema

```
ChatResponse {
    conversation_id: INTEGER           # The conversation ID (new or existing)
    response: STRING                   # Agent's natural language response
    tool_calls: ARRAY [                # MCP tools invoked (for transparency)
        {
            tool: STRING,              # Tool name (e.g., "add_task")
            arguments: OBJECT,         # Tool input
            result: OBJECT             # Tool output
        }
    ]
}
```

#### 2.2.4 Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| 400 | Invalid request body | `{"detail": "Message is required"}` |
| 401 | Missing/invalid JWT | `{"detail": "Not authenticated"}` |
| 403 | User ID mismatch | `{"detail": "Access denied"}` |
| 404 | Conversation not found | `{"detail": "Conversation not found"}` |
| 500 | Agent/MCP error | `{"detail": "Internal server error"}` |

### 2.3 Agent Layer (NEW)

#### 2.3.1 Agent Configuration

| Attribute | Value |
|-----------|-------|
| SDK | OpenAI Agents SDK |
| Model | `gpt-4o` (configurable) |
| System Prompt | Todo assistant persona |
| Tools | 5 MCP tools (see Section 2.4) |

#### 2.3.2 Agent System Prompt

```
You are a helpful Todo assistant. You help users manage their tasks through
natural conversation.

Capabilities:
- Add new tasks
- List tasks (all, pending, or completed)
- Mark tasks as complete
- Delete tasks
- Update task titles and descriptions

Behavior:
- Always confirm actions with clear responses
- When listing tasks, format them readably
- Handle errors gracefully with helpful messages
- Never fabricate task data - only report what tools return
- Ask for clarification when user intent is ambiguous
```

#### 2.3.3 Agent Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Agent Execution Cycle                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. RECEIVE: User message arrives at chat endpoint              │
│       │                                                         │
│       ▼                                                         │
│  2. RETRIEVE: Fetch conversation history from database          │
│       │                                                         │
│       ▼                                                         │
│  3. BUILD: Construct message array [history + new message]      │
│       │                                                         │
│       ▼                                                         │
│  4. STORE: Persist user message to database                     │
│       │                                                         │
│       ▼                                                         │
│  5. INVOKE: Run OpenAI Agent with MCP tools                     │
│       │                                                         │
│       ├──► Agent decides tool calls                             │
│       │       │                                                 │
│       │       ▼                                                 │
│       │    MCP Server executes tools                            │
│       │       │                                                 │
│       │       ▼                                                 │
│       │    Tools return results to agent                        │
│       │       │                                                 │
│       │       ▼                                                 │
│       ◄── Agent formulates response                             │
│       │                                                         │
│       ▼                                                         │
│  6. STORE: Persist assistant response to database               │
│       │                                                         │
│       ▼                                                         │
│  7. RETURN: Send response to client                             │
│       │                                                         │
│       ▼                                                         │
│  8. STATELESS: Server holds NO state (ready for next request)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 MCP Server (NEW)

#### 2.4.1 MCP Server Configuration

| Attribute | Value |
|-----------|-------|
| SDK | Official MCP Python SDK (`mcp`) |
| Transport | In-process (stdio not required) |
| Tools | 5 task management tools |

#### 2.4.2 Tool Definitions

##### Tool: `add_task`

| Attribute | Value |
|-----------|-------|
| Description | Create a new task for the user |
| Parameters | `user_id` (string, required), `title` (string, required), `description` (string, optional) |
| Returns | `{task_id: int, status: "created", title: string}` |
| Delegates To | `AddTaskUseCase` |

##### Tool: `list_tasks`

| Attribute | Value |
|-----------|-------|
| Description | Retrieve user's tasks with optional status filter |
| Parameters | `user_id` (string, required), `status` (string, optional: "all", "pending", "completed") |
| Returns | `[{id: int, title: string, description: string?, completed: bool}, ...]` |
| Delegates To | `ListTasksUseCase` |

##### Tool: `complete_task`

| Attribute | Value |
|-----------|-------|
| Description | Mark a task as completed |
| Parameters | `user_id` (string, required), `task_id` (int, required) |
| Returns | `{task_id: int, status: "completed", title: string}` |
| Delegates To | `CompleteTaskUseCase` |

##### Tool: `delete_task`

| Attribute | Value |
|-----------|-------|
| Description | Permanently remove a task |
| Parameters | `user_id` (string, required), `task_id` (int, required) |
| Returns | `{task_id: int, status: "deleted", title: string}` |
| Delegates To | `DeleteTaskUseCase` |

##### Tool: `update_task`

| Attribute | Value |
|-----------|-------|
| Description | Modify a task's title or description |
| Parameters | `user_id` (string, required), `task_id` (int, required), `title` (string, optional), `description` (string, optional) |
| Returns | `{task_id: int, status: "updated", title: string}` |
| Delegates To | `UpdateTaskUseCase` |

#### 2.4.3 Tool Error Handling

| Error Condition | Tool Response |
|-----------------|---------------|
| Task not found | `{error: "Task not found", task_id: X}` |
| Validation error | `{error: "Validation failed: <reason>"}` |
| Database error | `{error: "Database operation failed"}` |
| Unauthorized | `{error: "Access denied"}` |

### 2.5 ChatKit UI (NEW)

#### 2.5.1 Frontend Technology

| Attribute | Value |
|-----------|-------|
| Framework | Next.js (extend Phase II frontend) OR standalone |
| UI Library | OpenAI ChatKit |
| Deployment | Vercel |

#### 2.5.2 UI Components

```
┌─────────────────────────────────────────────────────────┐
│                    ChatKit Interface                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │            Conversation History                 │    │
│  │  ┌─────────────────────────────────────────┐   │    │
│  │  │ [User] Add a task to buy groceries      │   │    │
│  │  └─────────────────────────────────────────┘   │    │
│  │  ┌─────────────────────────────────────────┐   │    │
│  │  │ [Assistant] I've created a new task     │   │    │
│  │  │ "Buy groceries" for you. (ID: 5)        │   │    │
│  │  └─────────────────────────────────────────┘   │    │
│  │                    ...                         │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [Type your message...]              [Send]     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

#### 2.5.3 Frontend Responsibilities

| Responsibility | Implementation |
|----------------|----------------|
| Authentication | Use Better Auth (same as Phase II) |
| JWT Management | Store in httpOnly cookie, attach to requests |
| Chat State | Local state for UI; source of truth in DB |
| API Calls | `POST /api/{user_id}/chat` with message |
| Error Display | Show user-friendly error messages |

---

## Section 3: Integration Points

### 3.1 Agent → Phase II Task Logic via MCP

#### 3.1.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE III                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────────┐  │
│  │   ChatKit   │    │  Chat API   │    │          MCP Server             │  │
│  │   (React)   │───▶│  (FastAPI)  │───▶│  ┌─────────────────────────┐    │  │
│  └─────────────┘    └─────────────┘    │  │      MCP Tools          │    │  │
│                            │           │  │  - add_task             │    │  │
│                            ▼           │  │  - list_tasks           │    │  │
│                     ┌─────────────┐    │  │  - complete_task        │    │  │
│                     │   OpenAI    │◄──▶│  │  - delete_task          │    │  │
│                     │   Agent     │    │  │  - update_task          │    │  │
│                     └─────────────┘    │  └───────────┬─────────────┘    │  │
│                                        └──────────────┼──────────────────┘  │
│                                                       │                     │
├───────────────────────────────────────────────────────┼─────────────────────┤
│                           PHASE II (READ-ONLY)        │                     │
│                                                       ▼                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Application Layer                              │   │
│  │   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │   │
│  │   │AddTaskUseCase│ │ListTasksUCase│ │CompleteTask  │ ...            │   │
│  │   └──────┬───────┘ └──────┬───────┘ └──────┬───────┘                │   │
│  └──────────┼────────────────┼────────────────┼────────────────────────┘   │
│             │                │                │                             │
│             ▼                ▼                ▼                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Infrastructure Layer                             │   │
│  │              PostgreSQLTaskRepository (user-scoped)                 │   │
│  └─────────────────────────────────┬───────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│                          ┌─────────────────┐                               │
│                          │   Neon DB       │                               │
│                          │  (PostgreSQL)   │                               │
│                          └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.1.2 MCP Tool → Use Case Mapping (Detailed)

```python
# Conceptual flow (not actual code)

# MCP Tool: add_task
def add_task(user_id: str, title: str, description: str = None):
    session = get_session()                              # Phase II
    repository = PostgreSQLTaskRepository(session, user_id)  # Phase II
    use_case = AddTaskUseCase(repository)                # Phase II
    task = use_case.execute(title, description)          # Phase II
    return {"task_id": task.id, "status": "created", "title": task.title}

# MCP Tool: list_tasks
def list_tasks(user_id: str, status: str = "all"):
    session = get_session()                              # Phase II
    repository = PostgreSQLTaskRepository(session, user_id)  # Phase II
    use_case = ListTasksUseCase(repository)              # Phase II
    tasks = use_case.execute()                           # Phase II
    # Apply status filter in Phase III (Phase II returns all)
    if status == "pending":
        tasks = [t for t in tasks if not t.is_completed]
    elif status == "completed":
        tasks = [t for t in tasks if t.is_completed]
    return [{"id": t.id, "title": t.title, "completed": t.is_completed} for t in tasks]
```

#### 3.1.3 Dependency Injection Pattern

```
Request Scope:
    │
    ├─► get_current_user() → user_id (from JWT)
    │
    ├─► get_session() → SQLModel Session
    │
    ├─► PostgreSQLTaskRepository(session, user_id)
    │
    ├─► Use Case instances (with repository)
    │
    └─► MCP Tools (with use cases)
```

### 3.2 Conversation ↔ Database Mapping

#### 3.2.1 Conversation Lifecycle

```
NEW CONVERSATION:
┌─────────────────────────────────────────────────────────┐
│ 1. User sends first message (no conversation_id)        │
│ 2. Create new Conversation record                       │
│ 3. Create Message record (role: "user")                 │
│ 4. Run agent                                            │
│ 5. Create Message record (role: "assistant")            │
│ 6. Return conversation_id to client                     │
└─────────────────────────────────────────────────────────┘

EXISTING CONVERSATION:
┌─────────────────────────────────────────────────────────┐
│ 1. User sends message with conversation_id              │
│ 2. Validate conversation exists and belongs to user     │
│ 3. Fetch all messages for conversation (ordered)        │
│ 4. Create Message record (role: "user")                 │
│ 5. Build context: [history messages + new message]      │
│ 6. Run agent with full context                          │
│ 7. Create Message record (role: "assistant")            │
│ 8. Return response                                      │
└─────────────────────────────────────────────────────────┘
```

#### 3.2.2 Message History Retrieval

```sql
-- Retrieve conversation history for agent context
SELECT role, content, tool_calls, created_at
FROM message
WHERE conversation_id = :conversation_id
  AND user_id = :user_id
ORDER BY created_at ASC;
```

#### 3.2.3 Conversation Isolation

| Rule | Enforcement |
|------|-------------|
| User can only access own conversations | `WHERE user_id = :current_user_id` |
| User can only access own messages | FK constraint + query filter |
| Conversation ID must match user | Validate before processing |

### 3.3 Authentication Integration

#### 3.3.1 Token Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   ChatKit    │         │  Chat API    │         │   Phase II   │
│   Frontend   │         │  (Phase 3)   │         │   Auth       │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │  1. Login via          │                        │
       │     Better Auth        │                        │
       │───────────────────────────────────────────────▶│
       │                        │                        │
       │◀──────────────────────────────────────────────│
       │  2. Receive JWT        │                        │
       │                        │                        │
       │  3. Chat request       │                        │
       │     + JWT header       │                        │
       │───────────────────────▶│                        │
       │                        │                        │
       │                        │  4. Validate JWT       │
       │                        │     (reuse auth.py)    │
       │                        │───────────────────────▶│
       │                        │                        │
       │                        │◀───────────────────────│
       │                        │  5. Return user_id     │
       │                        │                        │
       │◀───────────────────────│                        │
       │  6. Chat response      │                        │
       │                        │                        │
```

---

## Section 4: Non-Goals

### 4.1 Explicitly Out of Scope

The following are **intentionally NOT part of Phase III**:

| Non-Goal | Rationale |
|----------|-----------|
| Modifying Phase II REST endpoints | Phase II API remains unchanged for existing frontend |
| Replacing Phase II frontend | ChatKit is an **additional** interface, not a replacement |
| Adding new task fields (due_date, priority, tags) | Deferred to Phase V (Advanced Features) |
| Real-time WebSocket updates | Not required; polling or page refresh suffices |
| Multi-user conversations | Each conversation belongs to one user |
| Voice input | Bonus feature, not core requirement |
| Urdu language support | Bonus feature, not core requirement |
| Offline support | Requires server for agent; always online |
| Task attachments/files | Not in scope |
| Task sharing between users | Not in scope |

### 4.2 Architectural Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Server-side session storage | Violates stateless architecture |
| Caching conversation in memory | Violates stateless architecture |
| Direct database queries for tasks | Must go through MCP tools |
| Custom ORM for Phase II tables | Reuse SQLModel definitions |
| New authentication system | Reuse Better Auth |
| Separate database | Use same Neon instance |

### 4.3 Technology Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Using LangChain | Spec requires OpenAI Agents SDK |
| Using Anthropic Claude API | Spec requires OpenAI Agents SDK |
| Custom MCP implementation | Spec requires Official MCP SDK |
| Custom chat UI | Spec requires OpenAI ChatKit |

---

## Section 5: Success Criteria

### 5.1 Functional Requirements

| ID | Requirement | Verification |
|----|-------------|--------------|
| F-001 | User can add task via natural language | "Add buy milk" → task created |
| F-002 | User can list tasks via natural language | "Show my tasks" → tasks displayed |
| F-003 | User can complete task via natural language | "Mark task 1 done" → task completed |
| F-004 | User can delete task via natural language | "Delete task 2" → task removed |
| F-005 | User can update task via natural language | "Rename task 1 to groceries" → updated |
| F-006 | Conversation persists across sessions | Close browser, reopen → history preserved |
| F-007 | Server restart doesn't lose conversations | Restart server → conversations intact |

### 5.2 Non-Functional Requirements

| ID | Requirement | Verification |
|----|-------------|--------------|
| NF-001 | Stateless server | Deploy 2 instances, requests work on either |
| NF-002 | User isolation | User A cannot see User B's conversations |
| NF-003 | JWT authentication | Requests without valid JWT return 401 |
| NF-004 | Phase II unchanged | All Phase II tests still pass |

---

## Approval Gate

**This specification requires explicit user approval before proceeding to the PLAN stage.**

Checklist:
- [ ] Reused components clearly identified
- [ ] New components clearly defined
- [ ] Integration points documented
- [ ] Non-goals explicitly stated
- [ ] Success criteria measurable

**Awaiting user approval: "Spec approved"**

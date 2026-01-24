# Phase III Atomic Task List

**Document Status:** TASKS Stage - Awaiting Approval
**Constitution Reference:** Article I (Development Order), Article VII (Validation Gates)
**Delta Spec Reference:** `/phase-3/specs/phase-3-delta.spec.md`

---

## Task Numbering Convention

```
T-3XX = Phase III Tasks
T-30X = Infrastructure & Setup
T-31X = Database Layer (Conversation/Message)
T-32X = MCP Tools Layer
T-33X = Agent Layer
T-34X = API Layer
T-35X = Integration & Testing
T-36X = Frontend (ChatKit)
```

---

## Phase III Directory Constraint

**ALL tasks MUST create files ONLY within:**
```
/phase-3/
├── backend/
├── frontend/
└── specs/
```

**NO task may modify:**
```
/phase2/    ← FROZEN
/phase1/    ← FROZEN
```

---

## Task Dependency Graph

```
T-301 ──► T-302 ──► T-311 ──► T-312 ──► T-313
                                          │
                                          ▼
T-321 ──► T-322 ──► T-323 ──► T-324 ──► T-325
                                          │
                                          ▼
                    T-331 ──► T-332 ──► T-333
                                          │
                                          ▼
                    T-341 ──► T-342 ──► T-343
                                          │
                                          ▼
                    T-351 ──► T-352 ──► T-353
                                          │
                                          ▼
                    T-361 ──► T-362 ──► T-363
```

---

## Infrastructure & Setup (T-30X)

### T-301: Initialize Phase III Backend Structure

**Spec Reference:** `phase-3-delta.spec.md` Section 2.1
**Deliverable:** Directory structure and configuration files

```
/phase-3/backend/
├── app/
│   ├── __init__.py
│   ├── models/
│   │   └── __init__.py
│   ├── repositories/
│   │   └── __init__.py
│   ├── mcp/
│   │   └── __init__.py
│   ├── agent/
│   │   └── __init__.py
│   ├── routers/
│   │   └── __init__.py
│   ├── schemas/
│   │   └── __init__.py
│   └── main.py
├── requirements.txt
├── alembic.ini
├── alembic/
│   └── versions/
└── CLAUDE.md
```

**Acceptance:**
- [ ] All directories created
- [ ] All `__init__.py` files present
- [ ] `requirements.txt` lists Phase III dependencies
- [ ] `CLAUDE.md` documents Phase III backend structure

**Dependencies:** None
**Phase II Integration:** None (setup only)

---

### T-302: Configure Phase III Dependencies

**Spec Reference:** `phase-3-delta.spec.md` Section 2.1, `agent.spec.md` Section 2
**Deliverable:** `/phase-3/backend/requirements.txt`

```
# Phase III Dependencies
openai-agents>=0.1.0        # OpenAI Agents SDK
mcp>=1.0.0                  # Official MCP SDK
sqlmodel>=0.0.14            # Already in Phase II, listed for clarity

# Phase II dependencies inherited via imports
# (fastapi, uvicorn, pydantic, etc.)
```

**Acceptance:**
- [ ] All required packages listed
- [ ] Version constraints specified
- [ ] No conflicts with Phase II dependencies

**Dependencies:** T-301
**Phase II Integration:** Inherits Phase II dependencies via imports

---

## Database Layer (T-31X)

### T-311: Create Conversation SQLModel

**Spec Reference:** `conversation.spec.md` Section 3.5
**Deliverable:** `/phase-3/backend/app/models/conversation.py`

```python
# T-311: Conversation SQLModel
# Spec: conversation.spec.md Section 3.5

class ConversationDB(SQLModel, table=True):
    __tablename__ = "conversation"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

**Acceptance:**
- [ ] Model matches spec exactly
- [ ] Foreign key references Phase II `user.id`
- [ ] Indexes defined per spec
- [ ] No modification to Phase II models

**Dependencies:** T-301
**Phase II Integration:** FK to `user.id` (Phase II Better Auth table)

---

### T-312: Create Message SQLModel

**Spec Reference:** `conversation.spec.md` Section 4.5
**Deliverable:** `/phase-3/backend/app/models/message.py`

```python
# T-312: Message SQLModel
# Spec: conversation.spec.md Section 4.5

class MessageDB(SQLModel, table=True):
    __tablename__ = "message"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True, nullable=False)
    user_id: str = Field(foreign_key="user.id", index=True, nullable=False)
    role: str = Field(nullable=False)  # "user" or "assistant"
    content: str = Field(nullable=False)
    tool_calls: Optional[Any] = Field(default=None, sa_column_kwargs={"type_": JSON})
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

**Acceptance:**
- [ ] Model matches spec exactly
- [ ] Foreign keys to `conversation.id` and `user.id`
- [ ] `tool_calls` uses JSON type
- [ ] Role constraint documented (enforced at app layer)

**Dependencies:** T-311
**Phase II Integration:** FK to `user.id` (Phase II Better Auth table)

---

### T-313: Create Alembic Migration for Phase III Tables

**Spec Reference:** `conversation.spec.md` Section 8.1
**Deliverable:** `/phase-3/backend/alembic/versions/phase3_001_conversation_message.py`

```python
# T-313: Alembic Migration
# Spec: conversation.spec.md Section 8.1

def upgrade():
    # Create conversation table
    op.create_table('conversation', ...)

    # Create message table
    op.create_table('message', ...)

def downgrade():
    op.drop_table('message')
    op.drop_table('conversation')
```

**Acceptance:**
- [ ] Migration creates both tables
- [ ] All indexes created
- [ ] Foreign keys reference Phase II tables
- [ ] Downgrade cleanly removes Phase III tables only
- [ ] Phase II tables (`task`, `user`) unchanged

**Dependencies:** T-311, T-312
**Phase II Integration:** References `user.id` FK

---

### T-314: Create Conversation Repository

**Spec Reference:** `conversation.spec.md` Section 6.1
**Deliverable:** `/phase-3/backend/app/repositories/conversation_repository.py`

```python
# T-314: Conversation Repository
# Spec: conversation.spec.md Section 6.1

class ConversationRepository:
    def create(self, user_id: str) -> ConversationDB: ...
    def get_by_id(self, conversation_id: int, user_id: str) -> Optional[ConversationDB]: ...
    def list_by_user(self, user_id: str, limit: int = 20, offset: int = 0) -> List[ConversationDB]: ...
    def update_timestamp(self, conversation_id: int) -> None: ...
    def delete(self, conversation_id: int, user_id: str) -> bool: ...
```

**Acceptance:**
- [ ] All methods implement user isolation (user_id in every query)
- [ ] Uses Phase II `get_session` for database access
- [ ] No direct access to `task` table

**Dependencies:** T-311, T-313
**Phase II Integration:** Imports `get_session` from Phase II

---

### T-315: Create Message Repository

**Spec Reference:** `conversation.spec.md` Section 6.2
**Deliverable:** `/phase-3/backend/app/repositories/message_repository.py`

```python
# T-315: Message Repository
# Spec: conversation.spec.md Section 6.2

class MessageRepository:
    def add(self, conversation_id: int, user_id: str, role: str,
            content: str, tool_calls: Optional[dict] = None) -> MessageDB: ...
    def get_history(self, conversation_id: int, user_id: str) -> List[MessageDB]: ...
    def get_latest(self, conversation_id: int) -> Optional[MessageDB]: ...
```

**Acceptance:**
- [ ] All methods implement user isolation
- [ ] Messages ordered chronologically (ASC) in get_history
- [ ] Uses Phase II `get_session`

**Dependencies:** T-312, T-313, T-314
**Phase II Integration:** Imports `get_session` from Phase II

---

## MCP Tools Layer (T-32X)

### T-321: Create MCP Server Scaffold

**Spec Reference:** `mcp-tools.spec.md` Section 2
**Deliverable:** `/phase-3/backend/app/mcp/server.py`

```python
# T-321: MCP Server Scaffold
# Spec: mcp-tools.spec.md Section 2

from mcp import Server

mcp_server = Server("todo-mcp-server")

# Tool registrations added in subsequent tasks
```

**Acceptance:**
- [ ] MCP server instantiated
- [ ] Server name matches spec
- [ ] Ready for tool registration

**Dependencies:** T-302
**Phase II Integration:** None (scaffold only)

---

### T-322: Implement add_task MCP Tool

**Spec Reference:** `mcp-tools.spec.md` Section 4.1
**Deliverable:** `/phase-3/backend/app/mcp/tools/add_task.py`

```python
# T-322: add_task MCP Tool
# Spec: mcp-tools.spec.md Section 4.1

@mcp_server.tool()
async def add_task(user_id: str, title: str, description: Optional[str] = None) -> dict:
    """Create a new task for the user."""
    # Delegates to Phase II AddTaskUseCase
    ...
```

**Acceptance:**
- [ ] Tool registered with MCP server
- [ ] Delegates to Phase II `AddTaskUseCase`
- [ ] Returns `{task_id, status, title}` per spec
- [ ] Handles errors gracefully

**Dependencies:** T-321
**Phase II Integration:** Imports and calls `AddTaskUseCase`

---

### T-323: Implement list_tasks MCP Tool

**Spec Reference:** `mcp-tools.spec.md` Section 4.2
**Deliverable:** `/phase-3/backend/app/mcp/tools/list_tasks.py`

```python
# T-323: list_tasks MCP Tool
# Spec: mcp-tools.spec.md Section 4.2

@mcp_server.tool()
async def list_tasks(user_id: str, status: Optional[str] = "all") -> list:
    """List tasks for the user, optionally filtered by status."""
    # Delegates to Phase II ListTasksUseCase
    ...
```

**Acceptance:**
- [ ] Supports status filter: "all", "pending", "completed"
- [ ] Delegates to Phase II `ListTasksUseCase`
- [ ] Returns array of `{id, title, description, completed}`
- [ ] User isolation enforced

**Dependencies:** T-321
**Phase II Integration:** Imports and calls `ListTasksUseCase`

---

### T-324: Implement complete_task MCP Tool

**Spec Reference:** `mcp-tools.spec.md` Section 4.3
**Deliverable:** `/phase-3/backend/app/mcp/tools/complete_task.py`

```python
# T-324: complete_task MCP Tool
# Spec: mcp-tools.spec.md Section 4.3

@mcp_server.tool()
async def complete_task(user_id: str, task_id: int) -> dict:
    """Mark a task as completed."""
    # Delegates to Phase II CompleteTaskUseCase
    ...
```

**Acceptance:**
- [ ] Delegates to Phase II `CompleteTaskUseCase`
- [ ] Returns `{task_id, status: "completed", title}`
- [ ] Returns error if task not found or not owned by user

**Dependencies:** T-321
**Phase II Integration:** Imports and calls `CompleteTaskUseCase`

---

### T-325: Implement delete_task MCP Tool

**Spec Reference:** `mcp-tools.spec.md` Section 4.4
**Deliverable:** `/phase-3/backend/app/mcp/tools/delete_task.py`

```python
# T-325: delete_task MCP Tool
# Spec: mcp-tools.spec.md Section 4.4

@mcp_server.tool()
async def delete_task(user_id: str, task_id: int) -> dict:
    """Delete a task."""
    # Delegates to Phase II DeleteTaskUseCase
    ...
```

**Acceptance:**
- [ ] Delegates to Phase II `DeleteTaskUseCase`
- [ ] Returns `{task_id, status: "deleted", title}`
- [ ] Returns error if task not found or not owned by user

**Dependencies:** T-321
**Phase II Integration:** Imports and calls `DeleteTaskUseCase`

---

### T-326: Implement update_task MCP Tool

**Spec Reference:** `mcp-tools.spec.md` Section 4.5
**Deliverable:** `/phase-3/backend/app/mcp/tools/update_task.py`

```python
# T-326: update_task MCP Tool
# Spec: mcp-tools.spec.md Section 4.5

@mcp_server.tool()
async def update_task(user_id: str, task_id: int,
                       title: Optional[str] = None,
                       description: Optional[str] = None) -> dict:
    """Update a task's title or description."""
    # Delegates to Phase II UpdateTaskUseCase
    ...
```

**Acceptance:**
- [ ] At least one of title/description must be provided
- [ ] Delegates to Phase II `UpdateTaskUseCase`
- [ ] Returns `{task_id, status: "updated", title}`

**Dependencies:** T-321
**Phase II Integration:** Imports and calls `UpdateTaskUseCase`

---

### T-327: Register All MCP Tools

**Spec Reference:** `mcp-tools.spec.md` Section 2
**Deliverable:** `/phase-3/backend/app/mcp/__init__.py`

```python
# T-327: MCP Tools Registration
# Spec: mcp-tools.spec.md Section 2

from .server import mcp_server
from .tools import add_task, list_tasks, complete_task, delete_task, update_task

# All tools registered via decorators
__all__ = ["mcp_server"]
```

**Acceptance:**
- [ ] All 5 tools importable from mcp module
- [ ] MCP server exports all tools
- [ ] Tool list matches spec exactly

**Dependencies:** T-322, T-323, T-324, T-325, T-326
**Phase II Integration:** All tools wrap Phase II use cases

---

## Agent Layer (T-33X)

### T-331: Create Agent Configuration

**Spec Reference:** `agent.spec.md` Section 3
**Deliverable:** `/phase-3/backend/app/agent/config.py`

```python
# T-331: Agent Configuration
# Spec: agent.spec.md Section 3

AGENT_CONFIG = {
    "name": "TodoAssistant",
    "model": "gpt-4o",
    "temperature": 0.7,
    "max_tokens": 1024,
}

SYSTEM_PROMPT = """
You are TodoAssistant, a helpful AI that manages the user's todo list.
...
"""
```

**Acceptance:**
- [ ] Configuration matches spec exactly
- [ ] System prompt includes all behavioral rules
- [ ] Tool list documented in prompt

**Dependencies:** T-302
**Phase II Integration:** None (configuration only)

---

### T-332: Create Agent Executor

**Spec Reference:** `agent.spec.md` Section 4
**Deliverable:** `/phase-3/backend/app/agent/executor.py`

```python
# T-332: Agent Executor
# Spec: agent.spec.md Section 4

class AgentExecutor:
    """Stateless agent execution following HYDRATE → APPEND → INVOKE → PERSIST → DEHYDRATE."""

    async def execute(
        self,
        user_id: str,
        conversation_id: Optional[int],
        message: str,
        session: Session
    ) -> AgentResult:
        # 1. HYDRATE: Load conversation history
        # 2. APPEND: Add user message
        # 3. INVOKE: Execute agent with MCP tools
        # 4. PERSIST: Store assistant response
        # 5. DEHYDRATE: Return result, release resources
        ...
```

**Acceptance:**
- [ ] Follows stateless execution model exactly
- [ ] Injects user_id into all tool calls
- [ ] Records tool_calls for transparency
- [ ] No state retained between calls

**Dependencies:** T-327, T-331, T-315
**Phase II Integration:** None direct (uses MCP tools which wrap Phase II)

---

### T-333: Create Agent Result Schema

**Spec Reference:** `agent.spec.md` Section 5, `chat-api.spec.md` Section 4
**Deliverable:** `/phase-3/backend/app/agent/result.py`

```python
# T-333: Agent Result Schema
# Spec: agent.spec.md Section 5

@dataclass
class ToolCallRecord:
    tool: str
    arguments: dict
    result: Any

@dataclass
class AgentResult:
    conversation_id: int
    response: str
    tool_calls: List[ToolCallRecord]
```

**Acceptance:**
- [ ] Schema matches chat API response requirements
- [ ] Tool calls captured with arguments and results
- [ ] Immutable result object

**Dependencies:** T-331
**Phase II Integration:** None (schema only)

---

## API Layer (T-34X)

### T-341: Create Chat Request/Response Schemas

**Spec Reference:** `chat-api.spec.md` Sections 3, 4
**Deliverable:** `/phase-3/backend/app/schemas/chat.py`

```python
# T-341: Chat Schemas
# Spec: chat-api.spec.md Sections 3, 4

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str = Field(..., min_length=1, max_length=4000)

class ToolCallResponse(BaseModel):
    tool: str
    arguments: dict
    result: Any

class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: List[ToolCallResponse]
```

**Acceptance:**
- [ ] Request schema matches spec with validations
- [ ] Response schema includes tool_calls array
- [ ] Pydantic validation enforced

**Dependencies:** T-301
**Phase II Integration:** None (schema only)

---

### T-342: Create Chat Router

**Spec Reference:** `chat-api.spec.md` Sections 2, 6
**Deliverable:** `/phase-3/backend/app/routers/chat.py`

```python
# T-342: Chat Router
# Spec: chat-api.spec.md Sections 2, 6

from fastapi import APIRouter, Depends, HTTPException
from phase2.backend.app.auth import get_current_user
from phase2.backend.app.database import get_session

chat_router = APIRouter()

@chat_router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user = Depends(get_current_user),
    session = Depends(get_session)
) -> ChatResponse:
    # Verify user_id matches authenticated user
    # Execute agent
    # Return response
    ...
```

**Acceptance:**
- [ ] Endpoint path matches spec: `POST /api/{user_id}/chat`
- [ ] Uses Phase II `get_current_user` for auth
- [ ] Uses Phase II `get_session` for DB
- [ ] Enforces user_id == current_user.id

**Dependencies:** T-341, T-332
**Phase II Integration:** Imports `get_current_user`, `get_session`

---

### T-343: Create Phase III Main Entry Point

**Spec Reference:** `chat-api.spec.md` Section 7.2, `phase-3-delta.spec.md` Section 3
**Deliverable:** `/phase-3/backend/app/main.py`

```python
# T-343: Phase III Main
# Spec: chat-api.spec.md Section 7.2

# Import Phase II app (DO NOT MODIFY)
from phase2.backend.app.main import app

# Import Phase III router
from .routers.chat import chat_router

# Register Phase III routes onto Phase II app
app.include_router(chat_router, prefix="/api", tags=["chat"])
```

**Acceptance:**
- [ ] Phase II app imported (not modified)
- [ ] Phase III router registered
- [ ] Both Phase II and Phase III routes work
- [ ] No Phase II files modified

**Dependencies:** T-342
**Phase II Integration:** Imports `app` from Phase II, registers Phase III router

---

## Integration & Testing (T-35X)

### T-351: Create Phase III Test Configuration

**Spec Reference:** Constitution Article VII (Verification Gate)
**Deliverable:** `/phase-3/backend/tests/conftest.py`

```python
# T-351: Test Configuration
# Spec: Constitution Article VII

import pytest
from phase2.backend.app.database import get_session
from phase2.backend.app.main import app

@pytest.fixture
def test_session():
    # Test database session
    ...

@pytest.fixture
def test_client():
    # FastAPI TestClient with Phase II + Phase III routes
    ...
```

**Acceptance:**
- [ ] Test fixtures for database session
- [ ] Test fixtures for API client
- [ ] Isolated test database (not production)

**Dependencies:** T-343
**Phase II Integration:** Uses Phase II test patterns

---

### T-352: Create MCP Tools Unit Tests

**Spec Reference:** `mcp-tools.spec.md` Section 6
**Deliverable:** `/phase-3/backend/tests/test_mcp_tools.py`

```python
# T-352: MCP Tools Tests
# Spec: mcp-tools.spec.md Section 6

def test_add_task_creates_task(): ...
def test_list_tasks_returns_user_tasks(): ...
def test_list_tasks_filters_by_status(): ...
def test_complete_task_marks_complete(): ...
def test_delete_task_removes_task(): ...
def test_update_task_modifies_task(): ...
def test_user_isolation_enforced(): ...
```

**Acceptance:**
- [ ] Each tool has at least one test
- [ ] User isolation tested
- [ ] Error cases tested

**Dependencies:** T-327, T-351
**Phase II Integration:** Tests verify Phase II use cases called correctly

---

### T-353: Create Chat API Integration Tests

**Spec Reference:** `chat-api.spec.md` Section 12
**Deliverable:** `/phase-3/backend/tests/test_chat_api.py`

```python
# T-353: Chat API Tests
# Spec: chat-api.spec.md Section 12

def test_chat_requires_auth(): ...
def test_chat_creates_new_conversation(): ...
def test_chat_continues_existing_conversation(): ...
def test_chat_returns_tool_calls(): ...
def test_chat_user_isolation(): ...
def test_chat_invalid_conversation_404(): ...
```

**Acceptance:**
- [ ] All acceptance criteria from spec verified
- [ ] Auth enforcement tested
- [ ] Conversation lifecycle tested
- [ ] Tool call transparency tested

**Dependencies:** T-343, T-351
**Phase II Integration:** Tests use Phase II auth

---

### T-354: Create Conversation Repository Tests

**Spec Reference:** `conversation.spec.md` Section 10
**Deliverable:** `/phase-3/backend/tests/test_conversation_repository.py`

```python
# T-354: Conversation Repository Tests
# Spec: conversation.spec.md Section 10

def test_create_conversation(): ...
def test_get_conversation_by_id(): ...
def test_get_conversation_user_isolation(): ...
def test_list_conversations_by_user(): ...
def test_cascade_delete(): ...
```

**Acceptance:**
- [ ] CRUD operations tested
- [ ] User isolation verified
- [ ] Cascade delete verified

**Dependencies:** T-314, T-315, T-351
**Phase II Integration:** None (tests Phase III tables only)

---

## Frontend - ChatKit (T-36X)

### T-361: Initialize Phase III Frontend Structure

**Spec Reference:** `phase-3-delta.spec.md` Section 2.6
**Deliverable:** Frontend directory structure

```
/phase-3/frontend/
├── src/
│   ├── components/
│   │   └── Chat/
│   ├── hooks/
│   ├── services/
│   └── App.tsx
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

**Acceptance:**
- [ ] Directory structure created
- [ ] Package.json with ChatKit dependency
- [ ] TypeScript configured

**Dependencies:** None
**Phase II Integration:** None (frontend is separate)

---

### T-362: Implement Chat Service

**Spec Reference:** `chat-api.spec.md` Sections 3, 4
**Deliverable:** `/phase-3/frontend/src/services/chatService.ts`

```typescript
// T-362: Chat Service
// Spec: chat-api.spec.md Sections 3, 4

interface ChatRequest {
  conversation_id?: number;
  message: string;
}

interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCall[];
}

export async function sendMessage(
  userId: string,
  request: ChatRequest,
  token: string
): Promise<ChatResponse> {
  // POST /api/{userId}/chat
  ...
}
```

**Acceptance:**
- [ ] Types match API spec
- [ ] Auth token included in requests
- [ ] Error handling implemented

**Dependencies:** T-361
**Phase II Integration:** Uses Phase II auth token

---

### T-363: Implement ChatKit UI Component

**Spec Reference:** `phase-3-delta.spec.md` Section 2.6
**Deliverable:** `/phase-3/frontend/src/components/Chat/ChatWindow.tsx`

```typescript
// T-363: ChatKit UI
// Spec: phase-3-delta.spec.md Section 2.6

import { Chat } from '@openai/chat-kit';

export function ChatWindow({ userId, token }: Props) {
  // Integrate ChatKit with our API
  // Handle conversation state
  // Display tool call transparency
  ...
}
```

**Acceptance:**
- [ ] ChatKit integrated
- [ ] Messages displayed correctly
- [ ] Tool calls shown for transparency
- [ ] New/continue conversation works

**Dependencies:** T-362
**Phase II Integration:** Auth token from Phase II

---

## Task Summary

| Category | Task Range | Count |
|----------|------------|-------|
| Infrastructure | T-301 - T-302 | 2 |
| Database | T-311 - T-315 | 5 |
| MCP Tools | T-321 - T-327 | 7 |
| Agent | T-331 - T-333 | 3 |
| API | T-341 - T-343 | 3 |
| Testing | T-351 - T-354 | 4 |
| Frontend | T-361 - T-363 | 3 |
| **Total** | | **27** |

---

## Phase II Integration Summary

| Task | Phase II Component Used | Integration Type |
|------|------------------------|------------------|
| T-311, T-312 | `user.id` (Better Auth) | Foreign Key |
| T-313 | `user` table schema | Reference Only |
| T-314, T-315 | `get_session` | Import |
| T-322 | `AddTaskUseCase` | Import + Call |
| T-323 | `ListTasksUseCase` | Import + Call |
| T-324 | `CompleteTaskUseCase` | Import + Call |
| T-325 | `DeleteTaskUseCase` | Import + Call |
| T-326 | `UpdateTaskUseCase` | Import + Call |
| T-342 | `get_current_user`, `get_session` | Import |
| T-343 | `app` (FastAPI) | Import + Extend |

---

## Approval Gate

**Awaiting user approval: "Tasks approved"**

---

## Constitution Compliance Checklist

- [x] All tasks reference spec sections
- [x] All tasks have unique IDs (T-3XX)
- [x] All tasks touch only `/phase-3/`
- [x] All Phase II integrations are import-only
- [x] No Phase II modifications in any task
- [x] Dependencies between tasks identified
- [x] Acceptance criteria defined for each task

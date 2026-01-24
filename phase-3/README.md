# Phase III: AI-Powered Todo Chatbot

**Status:** COMPLETE
**Date:** January 2026
**Architecture:** Stateless MCP-based AI Agent

---

## Overview

Phase III extends the Phase II full-stack Todo application with an AI-powered chatbot interface. Users can manage tasks through natural language conversation instead of (or alongside) the traditional UI.

### Key Achievements

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Phase II unchanged | PASS | `git diff phase2/` returns empty |
| Chatbot manages tasks via MCP | PASS | 5 MCP tools delegate to Phase II use cases |
| Conversation resumes after restart | PASS | ConversationDB + MessageDB persist to PostgreSQL |
| Stateless server | PASS | HYDRATE/DEHYDRATE lifecycle, no in-memory state |
| All deliverables complete | PASS | 41 files, ~2,839 lines of code |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PHASE III ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │   ChatKit   │    │   FastAPI   │    │      PostgreSQL         │ │
│  │   Frontend  │───►│   Backend   │───►│  (Neon)                 │ │
│  │  (Next.js)  │    │  (Phase II  │    │                         │ │
│  │             │    │  + Phase III│    │  ┌─────────────────┐    │ │
│  └─────────────┘    │   router)   │    │  │ conversation    │    │ │
│                     └──────┬──────┘    │  │ message         │    │ │
│                            │           │  │ task (Phase II) │    │ │
│                            ▼           │  │ user (Phase II) │    │ │
│                     ┌─────────────┐    │  └─────────────────┘    │ │
│                     │   Agent     │    │                         │ │
│                     │  Executor   │    └─────────────────────────┘ │
│                     │ (Stateless) │                                 │
│                     └──────┬──────┘                                 │
│                            │                                        │
│                            ▼                                        │
│                     ┌─────────────┐                                 │
│                     │  MCP Tools  │                                 │
│                     │  (Adapter)  │                                 │
│                     └──────┬──────┘                                 │
│                            │                                        │
│                            ▼                                        │
│                     ┌─────────────┐                                 │
│                     │  Phase II   │                                 │
│                     │  Use Cases  │◄── UNCHANGED                    │
│                     └─────────────┘                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Stateless Request Lifecycle

```
REQUEST → HYDRATE → APPEND → INVOKE → PERSIST → DEHYDRATE → RESPONSE
            │          │        │         │           │
            │          │        │         │           └─ Clear all memory
            │          │        │         └─ Save to DB
            │          │        └─ Execute LLM + MCP tools
            │          └─ Add user message
            └─ Load conversation from DB
```

---

## Directory Structure

```
/phase-3/
├── README.md                    # This file
├── constitution.md              # Governance rules
├── TASKS.md                     # Task tracking
├── specs/                       # Specifications
│   ├── phase-3-delta.spec.md   # Architecture overview
│   ├── conversation.spec.md     # Data models
│   ├── mcp-tools.spec.md        # Tool definitions
│   ├── agent.spec.md            # Agent behavior
│   └── chat-api.spec.md         # API contract
│
├── backend/                     # Python/FastAPI
│   ├── models/                  # SQLModel tables
│   │   ├── conversation.py      # ConversationDB
│   │   └── message.py           # MessageDB
│   ├── repositories/            # Data access
│   │   ├── conversation_repository.py
│   │   └── message_repository.py
│   ├── mcp/                     # MCP layer
│   │   ├── server.py            # MCP server scaffold
│   │   └── tools/               # 5 MCP tools
│   │       ├── add_task.py
│   │       ├── list_tasks.py
│   │       ├── complete_task.py
│   │       ├── delete_task.py
│   │       └── update_task.py
│   ├── agent/                   # AI agent
│   │   ├── config.py            # Model config + system prompt
│   │   ├── executor.py          # Stateless executor
│   │   └── result.py            # Result types
│   └── api/                     # HTTP layer
│       ├── schemas.py           # Request/Response models
│       ├── router.py            # POST /api/{user_id}/chat
│       └── main.py              # Mounts on Phase II app
│
└── frontend/                    # TypeScript/React
    ├── components/chat/         # UI components
    │   ├── ChatPanel.tsx        # Floating widget
    │   ├── ChatMessage.tsx      # Message bubble
    │   ├── ChatInput.tsx        # Input field
    │   └── ChatWrapper.tsx      # Auth integration
    ├── hooks/
    │   └── useChat.ts           # State management
    ├── lib/
    │   ├── types.ts             # TypeScript types
    │   └── chat-service.ts      # API client
    └── README.md                # Integration guide
```

---

## Components

### Backend

| Component | File | Description |
|-----------|------|-------------|
| **ConversationDB** | `models/conversation.py` | Stores chat sessions per user |
| **MessageDB** | `models/message.py` | Stores messages with tool_calls JSON |
| **ConversationRepository** | `repositories/conversation_repository.py` | CRUD with user isolation |
| **MessageRepository** | `repositories/message_repository.py` | History retrieval |
| **MCP Server** | `mcp/server.py` | Tool registration and dispatch |
| **add_task** | `mcp/tools/add_task.py` | Creates tasks via AddTaskUseCase |
| **list_tasks** | `mcp/tools/list_tasks.py` | Lists tasks via ListTasksUseCase |
| **complete_task** | `mcp/tools/complete_task.py` | Completes via CompleteTaskUseCase |
| **delete_task** | `mcp/tools/delete_task.py` | Deletes via DeleteTaskUseCase |
| **update_task** | `mcp/tools/update_task.py` | Updates via UpdateTaskUseCase |
| **AgentExecutor** | `agent/executor.py` | Stateless LLM orchestration |
| **Chat Router** | `api/router.py` | POST /api/{user_id}/chat |

### Frontend

| Component | File | Description |
|-----------|------|-------------|
| **ChatPanel** | `components/chat/ChatPanel.tsx` | Floating chat widget |
| **ChatMessage** | `components/chat/ChatMessage.tsx` | Message with tool badges |
| **ChatInput** | `components/chat/ChatInput.tsx` | Text input with send |
| **ChatWrapper** | `components/chat/ChatWrapper.tsx` | Phase II auth integration |
| **useChat** | `hooks/useChat.ts` | Stateless state management |
| **chat-service** | `lib/chat-service.ts` | API client |

---

## API Endpoint

### POST /api/{user_id}/chat

**Request:**
```json
{
  "conversation_id": null,
  "message": "Add a task to buy milk"
}
```

**Response:**
```json
{
  "conversation_id": 123,
  "response": "Done! I've added 'Buy milk' to your list (Task #42).",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": { "title": "Buy milk" },
      "result": { "task_id": 42, "status": "created", "title": "Buy milk" }
    }
  ]
}
```

**Errors:**
| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 403 | User ID mismatch |
| 404 | Conversation not found |
| 422 | Validation error |
| 503 | AI service unavailable |

---

## MCP Tools

All tools delegate to Phase II use cases (ADAPTER pattern):

| Tool | Phase II Use Case | Description |
|------|-------------------|-------------|
| `add_task` | AddTaskUseCase | Create new task |
| `list_tasks` | ListTasksUseCase | List with status filter |
| `complete_task` | CompleteTaskUseCase | Mark task done |
| `delete_task` | DeleteTaskUseCase | Remove task |
| `update_task` | UpdateTaskUseCase | Modify title/description |

**Security:** `user_id` is injected by the agent layer into every tool call. The LLM cannot bypass user isolation.

---

## Running Phase III

### Backend

```bash
cd phase-3/backend

# Install dependencies (if not already)
pip install openai sqlmodel fastapi

# Set environment variables
export OPENAI_API_KEY=your_key
export DATABASE_URL=postgresql://...

# Run server (extends Phase II)
python -m api.main
# or
uvicorn api.main:app --reload --port 8000
```

### Frontend Integration

Copy Phase III chat components into Phase II frontend:

```bash
cp -r phase-3/frontend/components/chat phase2/frontend/components/
cp -r phase-3/frontend/hooks phase2/frontend/
cp phase-3/frontend/lib/*.ts phase2/frontend/lib/
```

Add to Phase II's `app/layout.tsx`:

```tsx
import { getSession, getToken } from "@/lib/auth";
import { ChatWrapper } from "@/components/chat/ChatWrapper";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <ChatWrapper getSession={getSession} getToken={getToken} />
        </Providers>
      </body>
    </html>
  );
}
```

---

## Validation Checklist

### Phase II Unchanged
- [x] No files modified in `/phase2/`
- [x] Phase II routes still work
- [x] Phase II auth reused (not duplicated)
- [x] Phase II database models untouched

### MCP Tool Integration
- [x] 5 tools implemented (add, list, complete, delete, update)
- [x] Each tool delegates to Phase II use case
- [x] User ID injected into every tool call
- [x] Tool calls recorded for transparency

### Conversation Persistence
- [x] ConversationDB model with user_id FK
- [x] MessageDB model with role, content, tool_calls
- [x] History loaded from DB on each request
- [x] Messages persisted after each exchange

### Stateless Architecture
- [x] HYDRATE phase loads from DB
- [x] DEHYDRATE phase clears memory
- [x] No module-level state
- [x] AgentExecutor created per request
- [x] Server can restart mid-conversation

### Deliverables
- [x] Backend: models, repositories, MCP tools, agent, API
- [x] Frontend: ChatPanel, ChatMessage, ChatInput, useChat
- [x] Specs: 5 specification documents
- [x] Documentation: README files

---

## Example Conversation

```
User: Show me my tasks
[Tool: list_tasks] → Returns 3 tasks
Assistant: Here are your tasks:
  1. Buy groceries (pending) - #41
  2. Call mom (completed) - #38
  3. Finish report (pending) - #45

User: Mark the groceries task as done
[Tool: list_tasks] → Find task with "groceries"
[Tool: complete_task] → Complete task #41
Assistant: Done! I've marked 'Buy groceries' (#41) as complete.

User: Add a task to review PR
[Tool: add_task] → Creates task #46
Assistant: Got it! I've added 'Review PR' to your list (Task #46).

[Server restarts here - conversation continues from DB]

User: What tasks do I have left?
[Tool: list_tasks with status=pending] → Returns 2 tasks
Assistant: You have 2 pending tasks:
  1. Finish report - #45
  2. Review PR - #46
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Files | 41 |
| Lines of Code | ~2,839 |
| Backend Files | 24 |
| Frontend Files | 9 |
| Spec Files | 5 |
| MCP Tools | 5 |

---

## Phase Summary

**Phase III successfully adds an AI chatbot layer to the Phase II Todo application.**

- Phase II remains 100% unchanged
- Natural language interface via MCP tools
- Conversations persist across server restarts
- Fully stateless, horizontally scalable
- Tool transparency in responses

**The hackathon project is COMPLETE.**

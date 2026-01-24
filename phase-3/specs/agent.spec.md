# Agent Layer Specification

**Spec ID:** SPEC-P3-AGENT-001
**Status:** SPECIFY Stage - Awaiting Approval
**Constitution Reference:** Article V (MCP + Agent Enforcement Rules)

---

## 1. Overview

### 1.1 Purpose

The Agent Layer provides natural language understanding and orchestration for the Todo chatbot. It interprets user intent and invokes MCP tools to perform task operations.

### 1.2 Governing Principles

| Principle | Enforcement |
|-----------|-------------|
| Stateless Execution | Agent holds no state between requests |
| Tool-Only Task Access | Agent CANNOT access tasks except via MCP tools |
| Phase II Delegation | All task mutations delegate to Phase II use cases |
| Context from Database | Conversation history retrieved from DB per request |

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Agent Framework | OpenAI Agents SDK | Latest stable |
| LLM Model | `gpt-4o` | Current |
| Tool Protocol | MCP (Model Context Protocol) | Via Official SDK |

---

## 3. Agent Configuration

### 3.1 Agent Identity

```yaml
name: "TodoAssistant"
description: "AI assistant for managing todo tasks via natural language"
model: "gpt-4o"
temperature: 0.7
max_tokens: 1024
```

### 3.2 System Prompt

```
You are TodoAssistant, a helpful AI that manages the user's todo list.

## Your Capabilities (via tools)
- add_task: Create new tasks
- list_tasks: View tasks (all, pending, or completed)
- complete_task: Mark tasks as done
- delete_task: Remove tasks
- update_task: Modify task title or description

## Behavioral Rules
1. ALWAYS use tools to access or modify tasks. Never guess task data.
2. CONFIRM every action with a clear, friendly response.
3. When listing tasks, format them in a readable way.
4. If a task is not found, inform the user politely.
5. Ask for clarification if the user's intent is ambiguous.
6. Never fabricate task information not returned by tools.
7. Refer to tasks by their ID when confirming actions.

## Response Style
- Be concise but friendly
- Use natural language, not technical jargon
- Acknowledge what the user asked for
- Confirm what action was taken
```

### 3.3 Available Tools

| Tool Name | Purpose | Required |
|-----------|---------|----------|
| `add_task` | Create new task | Yes |
| `list_tasks` | Retrieve tasks | Yes |
| `complete_task` | Mark task complete | Yes |
| `delete_task` | Remove task | Yes |
| `update_task` | Modify task | Yes |

---

## 4. Stateless Execution Model

### 4.1 Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                 STATELESS REQUEST LIFECYCLE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  REQUEST ARRIVES                                                │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. HYDRATE: Load conversation history from database     │   │
│  │    - Query messages by conversation_id                  │   │
│  │    - Order by created_at ASC                            │   │
│  │    - Build messages array for agent                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. APPEND: Add new user message to array                │   │
│  │    - Persist user message to database                   │   │
│  │    - Append to in-flight messages array                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. INVOKE: Execute agent with messages + tools          │   │
│  │    - Agent processes context                            │   │
│  │    - Agent may call MCP tools (0 or more times)         │   │
│  │    - Agent generates response                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. PERSIST: Store assistant response to database        │   │
│  │    - Save response content                              │   │
│  │    - Save tool_calls metadata (for transparency)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 5. DEHYDRATE: Clear all in-memory state                 │   │
│  │    - Messages array discarded                           │   │
│  │    - Agent instance released                            │   │
│  │    - Server ready for next request                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  RESPONSE RETURNED                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Prohibited In-Memory State

| Prohibited | Reason |
|------------|--------|
| Caching conversation history | Violates stateless principle |
| Storing user preferences | Must retrieve from DB each request |
| Maintaining agent instances | Create fresh per request |
| Global message buffers | Each request isolated |

### 4.3 Permitted Transient State

| Permitted | Scope | Lifetime |
|-----------|-------|----------|
| Messages array for current request | Single request | Discarded after response |
| Agent instance | Single request | Garbage collected after response |
| Tool results | Single request | Used for response, then discarded |

---

## 5. Tool Access Restrictions

### 5.1 Tool-Only Task Access

The agent MUST access tasks exclusively through MCP tools:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PERMITTED                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agent ──► MCP Tool ──► Phase II Use Case ──► Database          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        FORBIDDEN                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agent ──► Direct SQL Query ──► Database         ❌ VIOLATION   │
│                                                                 │
│  Agent ──► Repository ──► Database               ❌ VIOLATION   │
│                                                                 │
│  Agent ──► Phase II Use Case ──► Database        ❌ VIOLATION   │
│           (bypassing MCP)                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 User Context Injection

The `user_id` is injected into every tool call by the agent layer:

```
User Message: "Add a task to buy milk"

Agent Layer:
1. Extract user_id from authenticated request
2. Call tool: add_task(user_id=<injected>, title="Buy milk")
3. Tool executes with user_id context
4. Agent cannot call tools for other users
```

### 5.3 Tool Call Audit

All tool calls MUST be logged for transparency:

```yaml
tool_call_record:
  tool: "add_task"
  timestamp: "2026-01-22T10:30:00Z"
  user_id: "user_abc123"
  arguments:
    title: "Buy milk"
    description: null
  result:
    task_id: 42
    status: "created"
    title: "Buy milk"
```

---

## 6. Phase II Integration

### 6.1 Dependency Chain

```
Agent Layer (Phase III)
    │
    ├─► Uses: OpenAI Agents SDK
    │
    ├─► Calls: MCP Tools (Phase III)
    │       │
    │       └─► Delegates to: Phase II Use Cases
    │               │
    │               └─► Uses: Phase II Repository
    │                       │
    │                       └─► Accesses: Phase II Database Models
    │
    └─► Reads: Phase II Auth (get_current_user)
```

### 6.2 No Phase II Modification

| Phase II Component | Agent Layer Usage |
|-------------------|-------------------|
| `TaskDB` model | Read-only reference (via tools) |
| Use cases | Called by MCP tools, not agent |
| Repository | Instantiated by MCP tools |
| Auth | Reused for user_id extraction |

---

## 7. Error Handling

### 7.1 Error Categories

| Category | Source | Agent Behavior |
|----------|--------|----------------|
| Tool Error | MCP tool returns error | Inform user with friendly message |
| Task Not Found | Phase II returns None | "I couldn't find that task" |
| Validation Error | Phase II validation | "That title is too long" |
| Auth Error | JWT invalid | Request rejected before agent |
| LLM Error | OpenAI API failure | "I'm having trouble. Try again." |

### 7.2 Error Response Format

```yaml
# Tool returns error
tool_result:
  error: "Task not found"
  task_id: 999

# Agent response
assistant_message: "I couldn't find task #999. Would you like to see your current tasks?"
```

### 7.3 Graceful Degradation

If tool execution fails:
1. Agent acknowledges the failure
2. Agent suggests alternative actions
3. Agent does NOT retry automatically (user must re-request)

---

## 8. Message Format

### 8.1 Messages Array Structure

```yaml
messages:
  - role: "system"
    content: "<system prompt>"

  - role: "user"
    content: "Show me my tasks"

  - role: "assistant"
    content: "Here are your tasks:\n1. Buy groceries\n2. Call mom"
    tool_calls:
      - tool: "list_tasks"
        arguments: { status: "all" }
        result: [...]

  - role: "user"
    content: "Mark task 1 as done"   # <-- Current message
```

### 8.2 Context Window Management

| Limit | Strategy |
|-------|----------|
| Token limit approaching | Truncate oldest messages (keep system prompt) |
| Very long conversation | Summarize history before truncating |
| Maximum messages | Last N messages + system prompt |

---

## 9. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-001 | Agent uses only MCP tools for task access | Code review: no direct DB calls |
| AC-002 | Agent is stateless | Restart server mid-conversation; continue works |
| AC-003 | Agent injects user_id into all tool calls | Log inspection shows user_id in every call |
| AC-004 | Agent confirms actions to user | Every task operation gets verbal confirmation |
| AC-005 | Agent handles tool errors gracefully | Simulate tool failure; agent responds helpfully |

---

## Approval Gate

**Awaiting user approval: "Agent spec approved"**

# Chat API Specification

**Spec ID:** SPEC-P3-API-001
**Status:** SPECIFY Stage - Awaiting Approval
**Constitution Reference:** Article III (Phase II Continuation Rules), Article IV (Stateless Architecture)

---

## 1. Overview

### 1.1 Purpose

This specification defines a NEW chat endpoint that is layered onto the existing Phase II FastAPI application. The endpoint provides the HTTP interface for the AI chatbot.

### 1.2 Governing Principles

| Principle | Enforcement |
|-----------|-------------|
| Additive Only | NEW endpoint; no modification to Phase II routes |
| Stateless Request Handling | All state retrieved/persisted via database |
| Phase II Auth Reuse | Use existing `get_current_user` dependency |
| User Isolation | Every request scoped to authenticated user |

### 1.3 Scope Boundary

| In Scope (NEW) | Out of Scope (PHASE II - DO NOT MODIFY) |
|----------------|----------------------------------------|
| `POST /api/{user_id}/chat` endpoint | Existing task endpoints |
| Chat request/response schemas | Phase II router files |
| Chat router module | `main.py` route registration pattern |
| Conversation management | Auth middleware |

---

## 2. Endpoint Definition

### 2.1 Route Specification

```yaml
endpoint: POST /api/{user_id}/chat
description: Send a message to the AI assistant and receive a response
authentication: Required (JWT Bearer Token)
content_type: application/json
```

### 2.2 URL Structure

```
POST /api/{user_id}/chat
         └─────┬─────┘
               │
               └─► Path parameter: User ID from auth token
                   (must match authenticated user)
```

### 2.3 Security Constraint

The `{user_id}` path parameter MUST match the authenticated user's ID:

```python
# Enforcement pattern (conceptual)
if path_user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Access denied")
```

---

## 3. Request Schema

### 3.1 Request Body

```json
{
  "conversation_id": 123,        // Optional: null for new conversation
  "message": "Add a task to buy groceries"
}
```

### 3.2 JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ChatRequest",
  "type": "object",
  "required": ["message"],
  "properties": {
    "conversation_id": {
      "type": ["integer", "null"],
      "description": "ID of existing conversation. Null or omitted to start new conversation."
    },
    "message": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4000,
      "description": "User's message to the assistant"
    }
  },
  "additionalProperties": false
}
```

### 3.3 Pydantic Model

```python
from pydantic import BaseModel, Field
from typing import Optional

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = Field(
        default=None,
        description="ID of existing conversation. Null to start new conversation."
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="User's message to the assistant"
    )
```

### 3.4 Request Validation Rules

| Field | Validation | Error Response |
|-------|------------|----------------|
| `message` | Required, non-empty | 422: "message is required" |
| `message` | Max 4000 chars | 422: "message too long" |
| `conversation_id` | If provided, must exist | 404: "Conversation not found" |
| `conversation_id` | If provided, must belong to user | 403: "Access denied" |

---

## 4. Response Schema

### 4.1 Success Response (200 OK)

```json
{
  "conversation_id": 123,
  "response": "I've added 'Buy groceries' to your task list. Is there anything else you'd like to do?",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {
        "user_id": "user_abc123",
        "title": "Buy groceries"
      },
      "result": {
        "task_id": 42,
        "status": "created",
        "title": "Buy groceries"
      }
    }
  ]
}
```

### 4.2 JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ChatResponse",
  "type": "object",
  "required": ["conversation_id", "response", "tool_calls"],
  "properties": {
    "conversation_id": {
      "type": "integer",
      "description": "ID of the conversation (new or existing)"
    },
    "response": {
      "type": "string",
      "description": "Assistant's text response to the user"
    },
    "tool_calls": {
      "type": "array",
      "description": "List of tools invoked during this request",
      "items": {
        "type": "object",
        "properties": {
          "tool": {
            "type": "string",
            "description": "Name of the MCP tool that was called"
          },
          "arguments": {
            "type": "object",
            "description": "Arguments passed to the tool"
          },
          "result": {
            "type": "object",
            "description": "Result returned by the tool"
          }
        }
      }
    }
  }
}
```

### 4.3 Pydantic Model

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Any

class ToolCallRecord(BaseModel):
    tool: str = Field(..., description="Name of the MCP tool called")
    arguments: dict = Field(..., description="Arguments passed to the tool")
    result: Any = Field(..., description="Result returned by the tool")

class ChatResponse(BaseModel):
    conversation_id: int = Field(..., description="ID of the conversation")
    response: str = Field(..., description="Assistant's text response")
    tool_calls: List[ToolCallRecord] = Field(
        default_factory=list,
        description="List of tools invoked during this request"
    )
```

---

## 5. Error Responses

### 5.1 Error Response Schema

```json
{
  "detail": "Error message describing what went wrong"
}
```

### 5.2 Error Codes

| Status | Condition | Response Body |
|--------|-----------|---------------|
| 400 | Invalid request format | `{"detail": "Invalid request"}` |
| 401 | Missing/invalid JWT | `{"detail": "Not authenticated"}` |
| 403 | User ID mismatch | `{"detail": "Access denied"}` |
| 404 | Conversation not found | `{"detail": "Conversation not found"}` |
| 422 | Validation error | `{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}` |
| 500 | Internal server error | `{"detail": "Internal server error"}` |
| 503 | Agent unavailable | `{"detail": "Service temporarily unavailable"}` |

---

## 6. Request Lifecycle

### 6.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CHAT REQUEST LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CLIENT REQUEST                                                             │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. AUTHENTICATE                                                     │   │
│  │    - Extract JWT from Authorization header                          │   │
│  │    - Validate token (reuse Phase II get_current_user)              │   │
│  │    - Verify user_id matches path parameter                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 2. VALIDATE REQUEST                                                 │   │
│  │    - Parse JSON body                                                │   │
│  │    - Validate against ChatRequest schema                            │   │
│  │    - Check conversation ownership (if conversation_id provided)     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 3. RESOLVE CONVERSATION                                             │   │
│  │    - If conversation_id is null: create new conversation            │   │
│  │    - If conversation_id provided: fetch existing conversation       │   │
│  │    - Load conversation history from message table                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 4. PERSIST USER MESSAGE                                             │   │
│  │    - Insert message record (role="user")                            │   │
│  │    - Update conversation.updated_at timestamp                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 5. INVOKE AGENT                                                     │   │
│  │    - Build messages array from history + new message                │   │
│  │    - Inject user_id context for tool calls                          │   │
│  │    - Execute agent with MCP tools                                   │   │
│  │    - Collect response and tool call records                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 6. PERSIST ASSISTANT MESSAGE                                        │   │
│  │    - Insert message record (role="assistant")                       │   │
│  │    - Store tool_calls JSON                                          │   │
│  │    - Update conversation.updated_at timestamp                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 7. RETURN RESPONSE                                                  │   │
│  │    - Build ChatResponse with conversation_id, response, tool_calls  │   │
│  │    - Return 200 OK                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  CLIENT RECEIVES RESPONSE                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Statelessness Verification

At each step, the server:
- Retrieves state from database (not memory)
- Persists state to database (not memory)
- Holds no references between requests

---

## 7. Phase II Integration

### 7.1 Reused Components

| Component | Source | Usage |
|-----------|--------|-------|
| `get_current_user` | `phase2.backend.app.auth` | JWT validation dependency |
| `get_session` | `phase2.backend.app.database` | Database session factory |
| FastAPI app | `phase2.backend.app.main` | Base application to extend |

### 7.2 Integration Pattern

```python
# Conceptual integration (not implementation code)

# Phase II imports (read-only usage)
from phase2.backend.app.auth import get_current_user
from phase2.backend.app.database import get_session
from phase2.backend.app.main import app  # Existing FastAPI app

# Phase III router
from phase3.backend.app.routers.chat import chat_router

# Register Phase III routes onto Phase II app
app.include_router(chat_router, prefix="/api", tags=["chat"])
```

### 7.3 Route Registration Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTE REGISTRATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase II FastAPI App (EXISTING - DO NOT MODIFY)                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /api/{user_id}/tasks      [GET, POST]   ◄── Phase II   │   │
│  │  /api/{user_id}/tasks/{id} [GET, PUT, DELETE]           │   │
│  │  /api/auth/...             [Auth routes]                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          │ include_router()                     │
│                          ▼                                      │
│  Phase III Router (NEW)                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /api/{user_id}/chat       [POST]        ◄── Phase III  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Authentication Flow

### 8.1 JWT Verification

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Request Headers:                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Authorization: Bearer <jwt_token>                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  Phase II Auth (REUSED)                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  get_current_user(token) → UserDB                       │   │
│  │                                                         │   │
│  │  - Validates JWT signature                              │   │
│  │  - Checks token expiration                              │   │
│  │  - Returns authenticated user                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  Path Parameter Validation (NEW)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  if path_user_id != current_user.id:                    │   │
│  │      raise HTTPException(403)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  ✓ Request Authorized                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Auth Dependency

```python
# Conceptual pattern
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    current_user: UserDB = Depends(get_current_user),  # Phase II
    session: Session = Depends(get_session)            # Phase II
):
    # Verify path user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Proceed with chat logic...
```

---

## 9. Conversation Management

### 9.1 New Conversation Flow

When `conversation_id` is null or omitted:

```sql
-- 1. Create conversation
INSERT INTO conversation (user_id, created_at, updated_at)
VALUES (:user_id, NOW(), NOW())
RETURNING id;

-- 2. Insert user message
INSERT INTO message (conversation_id, user_id, role, content, created_at)
VALUES (:new_conv_id, :user_id, 'user', :message, NOW());

-- 3. Agent processes (no SQL)

-- 4. Insert assistant message
INSERT INTO message (conversation_id, user_id, role, content, tool_calls, created_at)
VALUES (:new_conv_id, :user_id, 'assistant', :response, :tool_calls_json, NOW());

-- 5. Return conversation_id = new_conv_id
```

### 9.2 Existing Conversation Flow

When `conversation_id` is provided:

```sql
-- 1. Verify ownership
SELECT id FROM conversation
WHERE id = :conversation_id AND user_id = :user_id;
-- If no result: 404 Not Found

-- 2. Load history
SELECT role, content, tool_calls, created_at
FROM message
WHERE conversation_id = :conversation_id
ORDER BY created_at ASC;

-- 3. Insert user message
INSERT INTO message (conversation_id, user_id, role, content, created_at)
VALUES (:conversation_id, :user_id, 'user', :message, NOW());

-- 4. Update conversation timestamp
UPDATE conversation SET updated_at = NOW() WHERE id = :conversation_id;

-- 5. Agent processes with history context

-- 6. Insert assistant message
INSERT INTO message (conversation_id, user_id, role, content, tool_calls, created_at)
VALUES (:conversation_id, :user_id, 'assistant', :response, :tool_calls_json, NOW());

-- 7. Return conversation_id
```

---

## 10. Router Definition

### 10.1 Router Module Structure

```python
# File: /phase-3/backend/app/routers/chat.py

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

# Phase II imports (read-only)
from phase2.backend.app.auth import get_current_user
from phase2.backend.app.database import get_session
from phase2.backend.app.infrastructure.models import UserDB

# Phase III imports
from ..schemas.chat import ChatRequest, ChatResponse

chat_router = APIRouter()

@chat_router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user: UserDB = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> ChatResponse:
    """
    Send a message to the AI assistant.

    - Creates new conversation if conversation_id is null
    - Continues existing conversation if conversation_id provided
    - Returns assistant response with tool call transparency
    """
    # Implementation delegated to TASKS stage
    ...
```

### 10.2 OpenAPI Documentation

```yaml
paths:
  /api/{user_id}/chat:
    post:
      summary: Chat with AI Assistant
      description: Send a message to the AI assistant and receive a response
      tags:
        - Chat
      security:
        - bearerAuth: []
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
          description: User ID (must match authenticated user)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '401':
          description: Not authenticated
        '403':
          description: Access denied
        '404':
          description: Conversation not found
        '422':
          description: Validation error
```

---

## 11. What This Spec Does NOT Define

### 11.1 Explicitly Excluded

| Exclusion | Reason |
|-----------|--------|
| Task API endpoints | Owned by Phase II |
| Auth endpoints | Owned by Phase II |
| WebSocket endpoint | Out of scope (HTTP polling only) |
| File upload endpoint | Not in Phase III requirements |
| Conversation list endpoint | Can be added later if needed |

### 11.2 Deferred to PLAN Stage

| Item | Reason for Deferral |
|------|---------------------|
| Rate limiting strategy | Implementation detail |
| Request timeout configuration | Deployment concern |
| Retry logic | Implementation detail |
| Logging format | Infrastructure concern |

---

## 12. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-001 | Endpoint accepts POST requests | curl test returns 200 |
| AC-002 | Auth required | Request without JWT returns 401 |
| AC-003 | User isolation enforced | User A cannot access User B's conversation |
| AC-004 | New conversation created when ID is null | Response contains new conversation_id |
| AC-005 | Existing conversation continued | History affects agent response |
| AC-006 | Tool calls included in response | tool_calls array populated when tools invoked |
| AC-007 | Messages persisted | Database query shows user and assistant messages |
| AC-008 | Phase II routes unchanged | Existing task endpoints still work |

---

## Approval Gate

**Awaiting user approval: "Chat API spec approved"**

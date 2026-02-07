# Conversation Data Model Specification

**Spec ID:** SPEC-P3-CONV-001
**Status:** SPECIFY Stage - Awaiting Approval
**Constitution Reference:** Article III (Phase II Continuation Rules)

---

## 1. Overview

### 1.1 Purpose

This specification defines NEW database models for storing conversation history. These models extend the existing Phase II database schema without modifying any Phase II tables.

### 1.2 Governing Principles

| Principle | Enforcement |
|-----------|-------------|
| Additive Only | Create NEW tables; never modify Phase II tables |
| Task Table Untouched | `task` table remains 100% owned by Phase II |
| Foreign Key Integrity | Reference `user.id` from Phase II (Better Auth) |
| Conversation Isolation | Each conversation belongs to exactly one user |

### 1.3 Scope Boundary

| In Scope (NEW) | Out of Scope (PHASE II - DO NOT MODIFY) |
|----------------|----------------------------------------|
| `conversation` table | `task` table |
| `message` table | `user` table |
| Conversation SQLModel | TaskDB SQLModel |
| Message SQLModel | UserDB SQLModel |

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE II TABLES (IMMUTABLE - DO NOT MODIFY)                               │
│  ═══════════════════════════════════════════                               │
│                                                                             │
│  ┌─────────────────────┐          ┌─────────────────────┐                  │
│  │        user         │          │        task         │                  │
│  │  (Better Auth)      │          │   (Phase II)        │                  │
│  ├─────────────────────┤          ├─────────────────────┤                  │
│  │ id: VARCHAR [PK]    │◄─────────│ user_id: VARCHAR[FK]│                  │
│  │ email: VARCHAR      │    │     │ id: INTEGER [PK]    │                  │
│  │ name: VARCHAR       │    │     │ title: VARCHAR      │                  │
│  │ ...                 │    │     │ description: TEXT   │                  │
│  └─────────────────────┘    │     │ completed: BOOLEAN  │                  │
│           ▲                 │     │ created_at: TS      │                  │
│           │                 │     │ updated_at: TS      │                  │
│           │                 │     └─────────────────────┘                  │
│           │                 │                                               │
│  ─────────┼─────────────────┼──────────────────────────────────────────────│
│           │                 │                                               │
│  PHASE III TABLES (NEW)    │                                               │
│  ══════════════════════    │                                               │
│           │                 │                                               │
│           │     ┌───────────┴─────────────────────┐                        │
│           │     │                                 │                        │
│  ┌────────┴────────────┐          ┌───────────────┴───────┐                │
│  │    conversation     │          │       message         │                │
│  │     (Phase III)     │          │     (Phase III)       │                │
│  ├─────────────────────┤          ├───────────────────────┤                │
│  │ id: INTEGER [PK]    │◄─────────│ conversation_id [FK]  │                │
│  │ user_id: VARCHAR[FK]│          │ id: INTEGER [PK]      │                │
│  │ created_at: TS      │          │ user_id: VARCHAR [FK] │                │
│  │ updated_at: TS      │          │ role: VARCHAR         │                │
│  └─────────────────────┘          │ content: TEXT         │                │
│                                   │ tool_calls: JSON      │                │
│                                   │ created_at: TS        │                │
│                                   └───────────────────────┘                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Table: `conversation`

### 3.1 Purpose

Track chat sessions. Each conversation is a container for a sequence of messages between a user and the assistant.

### 3.2 Schema Definition

```sql
CREATE TABLE conversation (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversation_user
        FOREIGN KEY (user_id)
        REFERENCES "user"(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_conversation_user_id ON conversation(user_id);
CREATE INDEX idx_conversation_updated ON conversation(updated_at DESC);
```

### 3.3 Column Specifications

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INTEGER | No | Auto | Primary key |
| `user_id` | VARCHAR(255) | No | - | FK to user.id (Better Auth) |
| `created_at` | TIMESTAMP | No | NOW() | When conversation started |
| `updated_at` | TIMESTAMP | No | NOW() | Last activity timestamp |

### 3.4 Constraints

| Constraint | Type | Description |
|------------|------|-------------|
| `pk_conversation` | PRIMARY KEY | `id` |
| `fk_conversation_user` | FOREIGN KEY | `user_id` → `user.id` |
| `idx_conversation_user_id` | INDEX | Fast lookup by user |
| `idx_conversation_updated` | INDEX | Sort by recent activity |

### 3.5 SQLModel Definition

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class ConversationDB(SQLModel, table=True):
    __tablename__ = "conversation"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

### 3.6 Behavioral Rules

| Rule | Enforcement |
|------|-------------|
| One user per conversation | `user_id` is immutable after creation |
| Cascading delete | Deleting user deletes all their conversations |
| Update timestamp on activity | `updated_at` refreshed on new message |

---

## 4. Table: `message`

### 4.1 Purpose

Store individual messages within a conversation. Supports conversation history retrieval for agent context building.

### 4.2 Schema Definition

```sql
CREATE TABLE message (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    user_id         VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL,
    content         TEXT NOT NULL,
    tool_calls      JSON,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversation(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_message_user
        FOREIGN KEY (user_id)
        REFERENCES "user"(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_message_role
        CHECK (role IN ('user', 'assistant'))
);

CREATE INDEX idx_message_conversation ON message(conversation_id);
CREATE INDEX idx_message_created ON message(created_at ASC);
CREATE INDEX idx_message_user ON message(user_id);
```

### 4.3 Column Specifications

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INTEGER | No | Auto | Primary key |
| `conversation_id` | INTEGER | No | - | FK to conversation.id |
| `user_id` | VARCHAR(255) | No | - | FK to user.id (redundant for security) |
| `role` | VARCHAR(20) | No | - | "user" or "assistant" |
| `content` | TEXT | No | - | Message text content |
| `tool_calls` | JSON | Yes | NULL | Tool invocations (assistant only) |
| `created_at` | TIMESTAMP | No | NOW() | Message timestamp |

### 4.4 Constraints

| Constraint | Type | Description |
|------------|------|-------------|
| `pk_message` | PRIMARY KEY | `id` |
| `fk_message_conversation` | FOREIGN KEY | `conversation_id` → `conversation.id` |
| `fk_message_user` | FOREIGN KEY | `user_id` → `user.id` |
| `chk_message_role` | CHECK | role ∈ {"user", "assistant"} |
| `idx_message_conversation` | INDEX | Fast message retrieval |
| `idx_message_created` | INDEX | Chronological ordering |

### 4.5 SQLModel Definition

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional, Any

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

### 4.6 Role Values

| Role | Description | tool_calls |
|------|-------------|------------|
| `user` | Message from human user | Always NULL |
| `assistant` | Response from AI agent | May contain tool call records |

### 4.7 Tool Calls JSON Structure

When `role = "assistant"` and tools were invoked:

```json
{
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {
        "user_id": "user_abc",
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

---

## 5. Data Access Patterns

### 5.1 Create New Conversation

```sql
INSERT INTO conversation (user_id, created_at, updated_at)
VALUES (:user_id, NOW(), NOW())
RETURNING id;
```

### 5.2 Add Message to Conversation

```sql
-- First, verify conversation belongs to user
SELECT id FROM conversation
WHERE id = :conversation_id AND user_id = :user_id;

-- Then insert message
INSERT INTO message (conversation_id, user_id, role, content, tool_calls, created_at)
VALUES (:conversation_id, :user_id, :role, :content, :tool_calls, NOW());

-- Update conversation timestamp
UPDATE conversation SET updated_at = NOW() WHERE id = :conversation_id;
```

### 5.3 Retrieve Conversation History

```sql
SELECT role, content, tool_calls, created_at
FROM message
WHERE conversation_id = :conversation_id
  AND user_id = :user_id  -- Security: double-check ownership
ORDER BY created_at ASC;
```

### 5.4 List User's Conversations

```sql
SELECT id, created_at, updated_at
FROM conversation
WHERE user_id = :user_id
ORDER BY updated_at DESC
LIMIT :limit OFFSET :offset;
```

### 5.5 Get Latest Message (for preview)

```sql
SELECT m.content, m.role, m.created_at
FROM message m
WHERE m.conversation_id = :conversation_id
ORDER BY m.created_at DESC
LIMIT 1;
```

---

## 6. Repository Interface

### 6.1 ConversationRepository

```python
class ConversationRepository(Protocol):
    """Interface for conversation persistence."""

    def create(self, user_id: str) -> ConversationDB:
        """Create new conversation for user."""
        ...

    def get_by_id(self, conversation_id: int, user_id: str) -> Optional[ConversationDB]:
        """Get conversation if it belongs to user."""
        ...

    def list_by_user(self, user_id: str, limit: int = 20, offset: int = 0) -> List[ConversationDB]:
        """List user's conversations, most recent first."""
        ...

    def update_timestamp(self, conversation_id: int) -> None:
        """Update conversation's updated_at to now."""
        ...

    def delete(self, conversation_id: int, user_id: str) -> bool:
        """Delete conversation if it belongs to user."""
        ...
```

### 6.2 MessageRepository

```python
class MessageRepository(Protocol):
    """Interface for message persistence."""

    def add(self, conversation_id: int, user_id: str, role: str,
            content: str, tool_calls: Optional[dict] = None) -> MessageDB:
        """Add message to conversation."""
        ...

    def get_history(self, conversation_id: int, user_id: str) -> List[MessageDB]:
        """Get all messages for conversation in chronological order."""
        ...

    def get_latest(self, conversation_id: int) -> Optional[MessageDB]:
        """Get most recent message in conversation."""
        ...
```

---

## 7. Security Considerations

### 7.1 User Isolation

Every query MUST include `user_id` filter:

```python
# CORRECT - User-scoped query
def get_by_id(self, conversation_id: int, user_id: str):
    return session.query(ConversationDB).filter(
        ConversationDB.id == conversation_id,
        ConversationDB.user_id == user_id  # CRITICAL
    ).first()

# FORBIDDEN - Missing user scope
def get_by_id(self, conversation_id: int):
    return session.query(ConversationDB).filter(
        ConversationDB.id == conversation_id
    ).first()
```

### 7.2 Redundant User ID in Messages

`message.user_id` is intentionally redundant (duplicates `conversation.user_id`) for:
1. Defense in depth - additional security layer
2. Query efficiency - no JOIN needed for user filtering
3. Audit trail - explicit ownership per message

### 7.3 Cascade Deletion

When a user is deleted (via Better Auth):
- All conversations for user are deleted (CASCADE)
- All messages in those conversations are deleted (CASCADE)
- Task table is handled by Phase II (not our concern)

---

## 8. Migration Strategy

### 8.1 Migration Script

```python
"""
Phase III Migration: Add conversation and message tables

Revision ID: phase3_001
Create Date: 2026-01-22
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

def upgrade():
    # Create conversation table
    op.create_table(
        'conversation',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('idx_conversation_user_id', 'conversation', ['user_id'])
    op.create_index('idx_conversation_updated', 'conversation', ['updated_at'])

    # Create message table
    op.create_table(
        'message',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('conversation_id', sa.Integer(), sa.ForeignKey('conversation.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tool_calls', JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("role IN ('user', 'assistant')", name='chk_message_role'),
    )
    op.create_index('idx_message_conversation', 'message', ['conversation_id'])
    op.create_index('idx_message_created', 'message', ['created_at'])
    op.create_index('idx_message_user', 'message', ['user_id'])

def downgrade():
    op.drop_table('message')
    op.drop_table('conversation')
```

### 8.2 Migration Safety

| Check | Verification |
|-------|--------------|
| Phase II tables unaffected | `task` and `user` schemas unchanged |
| FK references valid | `user.id` exists in Phase II |
| Rollback works | `downgrade()` cleanly removes Phase III tables |

---

## 9. What This Spec Does NOT Define

### 9.1 Explicitly Excluded

| Exclusion | Reason |
|-----------|--------|
| `task` table schema | Owned by Phase II |
| `user` table schema | Owned by Better Auth (Phase II) |
| TaskDB model | Defined in Phase II |
| Task repository | Defined in Phase II |
| Any modifications to existing tables | Constitution Article III violation |

---

## 10. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-001 | `conversation` table created | Migration runs successfully |
| AC-002 | `message` table created | Migration runs successfully |
| AC-003 | `task` table unchanged | Schema diff shows no changes |
| AC-004 | User isolation works | User A cannot query User B's conversations |
| AC-005 | Cascade delete works | Deleting conversation deletes its messages |
| AC-006 | FK constraints valid | Insert with invalid user_id fails |

---

## Approval Gate

**Awaiting user approval: "Conversation spec approved"**

# Database Specification: PostgreSQL Schema

**Version:** 1.0
**Date:** January 3, 2026
**Database:** Neon Serverless PostgreSQL
**ORM:** SQLModel (SQLAlchemy + Pydantic)
**Status:** Specification

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Schema Design](#schema-design)
3. [Table Specifications](#table-specifications)
4. [Indexes](#indexes)
5. [Constraints](#constraints)
6. [Relationships](#relationships)
7. [Migration Strategy](#migration-strategy)
8. [Data Types and Validation](#data-types-and-validation)

---

## Database Overview

### Database Provider

**Provider:** Neon Serverless PostgreSQL
- Fully managed PostgreSQL database
- Serverless architecture (auto-scaling)
- Free tier available
- Built-in connection pooling
- Automatic backups

**PostgreSQL Version:** 15+

### Connection Details

**Environment Variable:**
```bash
DATABASE_URL=postgresql://user:password@ep-cool-name-123456.region.aws.neon.tech/dbname?sslmode=require
```

**Connection Format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**SSL/TLS:**
- Required in production (`sslmode=require`)
- Ensures encrypted connections

### ORM: SQLModel

**Why SQLModel:**
- Type-safe ORM (combines SQLAlchemy + Pydantic)
- Automatic validation
- FastAPI integration
- Python type hints throughout

**Installation:**
```bash
pip install sqlmodel
```

---

## Schema Design

### Entity-Relationship Diagram

```
┌──────────────────────────────────────┐
│            users                      │
│  (Managed by Better Auth)            │
├──────────────────────────────────────┤
│ • id (PK) TEXT                       │
│ • email UNIQUE TEXT                  │
│ • password_hash TEXT                 │
│ • name TEXT                          │
│ • created_at TIMESTAMP               │
│ • updated_at TIMESTAMP               │
└──────────────────┬───────────────────┘
                   │
                   │ 1:N
                   │
┌──────────────────▼───────────────────┐
│            tasks                      │
├──────────────────────────────────────┤
│ • id (PK) SERIAL                     │
│ • user_id (FK → users.id) TEXT      │
│ • title VARCHAR(200)                 │
│ • description TEXT                   │
│ • completed BOOLEAN                  │
│ • created_at TIMESTAMP               │
│ • updated_at TIMESTAMP               │
└──────────────────────────────────────┘
```

### Schema Principles

1. **Normalization:** 3NF (Third Normal Form)
   - No redundant data
   - Each table has single responsibility
   - Foreign keys ensure referential integrity

2. **Data Integrity:**
   - NOT NULL constraints where appropriate
   - Foreign key constraints
   - Check constraints for business rules
   - Unique constraints for emails

3. **Performance:**
   - Indexes on frequently queried columns
   - Index on foreign keys
   - Index on user_id for filtering

4. **Audit Trail:**
   - created_at timestamp on every record
   - updated_at timestamp for tracking changes

---

## Table Specifications

### Table 1: users

**Purpose:** Store user accounts (managed by Better Auth)

**Note:** This table is created and managed by Better Auth. We do NOT create it manually.

**Schema:**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,                 -- User ID (UUID or string from Better Auth)
    email TEXT NOT NULL UNIQUE,          -- User email (login identifier)
    password_hash TEXT NOT NULL,         -- Bcrypt password hash
    name TEXT,                           -- User display name (optional)
    created_at TIMESTAMP DEFAULT NOW(),  -- Account creation time
    updated_at TIMESTAMP DEFAULT NOW()   -- Last profile update
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique user identifier (set by Better Auth) |
| `email` | TEXT | NOT NULL, UNIQUE | User email address (case-insensitive) |
| `password_hash` | TEXT | NOT NULL | Bcrypt hash of password (cost factor 12) |
| `name` | TEXT | NULL | User's display name (optional) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));
```

**Ownership:** Better Auth (DO NOT modify this table manually)

---

### Table 2: tasks

**Purpose:** Store user tasks with ownership tracking

**Schema:**
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,               -- Auto-incrementing task ID
    user_id TEXT NOT NULL,               -- Owner of the task (FK)
    title VARCHAR(200) NOT NULL,         -- Task title
    description TEXT,                    -- Task description (optional)
    completed BOOLEAN NOT NULL DEFAULT FALSE,  -- Completion status
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),  -- Creation time
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),  -- Last update time

    -- Foreign key constraint
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE                -- Delete tasks if user is deleted
        ON UPDATE CASCADE                -- Update user_id if user.id changes
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique task identifier |
| `user_id` | TEXT | NOT NULL, FK → users(id) | Task owner (foreign key) |
| `title` | VARCHAR(200) | NOT NULL | Task title (1-200 chars) |
| `description` | TEXT | NULL | Task description (0-1000 chars) |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**SQLModel Definition:**
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class TaskDB(SQLModel, table=True):
    """
    Database model for tasks table.

    This is the infrastructure layer representation.
    Maps to Domain Task entity via repository.
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default="")
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """SQLModel configuration."""
        schema_extra = {
            "example": {
                "id": 42,
                "user_id": "user-123",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2026-01-03T10:30:00Z",
                "updated_at": "2026-01-03T10:30:00Z"
            }
        }
```

---

## Indexes

### Purpose of Indexes

Indexes improve query performance by allowing the database to find rows faster without scanning the entire table.

### Index Strategy

**Index on Frequently Filtered Columns:**
- `user_id` (every query filters by this)
- `completed` (for filtering pending/completed tasks)

**Index on Foreign Keys:**
- Automatically indexed in most databases
- Improves JOIN performance

### Index Definitions

#### 1. Index on user_id (Critical for Performance)

**Purpose:** Fast lookup of tasks by user

**Query Pattern:**
```sql
SELECT * FROM tasks WHERE user_id = 'user-123';
```

**Index:**
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**Expected Performance:**
- Without index: O(n) - full table scan
- With index: O(log n) - tree search
- For 1M tasks, 100 users: ~10,000x faster

#### 2. Composite Index on user_id + completed

**Purpose:** Fast filtering by user and completion status

**Query Pattern:**
```sql
SELECT * FROM tasks WHERE user_id = 'user-123' AND completed = false;
```

**Index:**
```sql
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
```

**Benefits:**
- Optimizes filtered queries (e.g., "show pending tasks")
- Covers common use case

#### 3. Index on created_at for Sorting

**Purpose:** Efficient sorting by creation date

**Query Pattern:**
```sql
SELECT * FROM tasks WHERE user_id = 'user-123' ORDER BY created_at DESC;
```

**Index:**
```sql
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

**Alternative:** Composite index on (user_id, created_at)
```sql
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
```

### Index Summary

```sql
-- Required indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
```

**Trade-offs:**
- **Pros:** Much faster SELECT queries
- **Cons:** Slightly slower INSERT/UPDATE (index must be updated)
- **Decision:** Worth it (reads > writes in this app)

---

## Constraints

### Purpose of Constraints

Constraints enforce business rules and data integrity at the database level.

### Constraint Types

#### 1. Primary Key Constraints

**tasks.id:**
```sql
id SERIAL PRIMARY KEY
```

**Ensures:**
- Every task has unique ID
- ID cannot be NULL
- Automatically indexed

**users.id:**
```sql
id TEXT PRIMARY KEY
```

**Ensures:**
- Every user has unique ID
- Managed by Better Auth

#### 2. Foreign Key Constraints

**tasks.user_id → users.id:**
```sql
CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
```

**Ensures:**
- Every task belongs to a valid user
- Cannot create tasks for non-existent users
- When user is deleted, their tasks are deleted (CASCADE)

**Cascade Behavior:**
- `ON DELETE CASCADE`: Delete tasks when user is deleted
- `ON UPDATE CASCADE`: Update user_id if user.id changes (rare)

#### 3. NOT NULL Constraints

**tasks.user_id:**
```sql
user_id TEXT NOT NULL
```

**Ensures:** Every task has an owner

**tasks.title:**
```sql
title VARCHAR(200) NOT NULL
```

**Ensures:** Every task has a title

**tasks.completed:**
```sql
completed BOOLEAN NOT NULL DEFAULT FALSE
```

**Ensures:** Completion status is always defined

#### 4. UNIQUE Constraints

**users.email:**
```sql
email TEXT NOT NULL UNIQUE
```

**Ensures:**
- No duplicate email addresses
- Case-insensitive uniqueness (via index on LOWER(email))

#### 5. CHECK Constraints (Optional)

**Validate title length:**
```sql
ALTER TABLE tasks
ADD CONSTRAINT check_title_length
CHECK (char_length(title) >= 1 AND char_length(title) <= 200);
```

**Validate description length:**
```sql
ALTER TABLE tasks
ADD CONSTRAINT check_description_length
CHECK (description IS NULL OR char_length(description) <= 1000);
```

**Note:** These are redundant if application validates, but provide defense in depth

---

## Relationships

### Relationship: users → tasks (One-to-Many)

**Relationship Type:** One-to-Many
- One user has many tasks
- One task belongs to one user

**Foreign Key:** `tasks.user_id` → `users.id`

**Cardinality:**
```
users (1) ──────< (N) tasks
```

**Referential Integrity:**
- Cannot create task without valid user_id
- Cannot delete user without handling their tasks

**Cascade Rules:**
- `ON DELETE CASCADE`: When user is deleted, all their tasks are deleted
- `ON UPDATE CASCADE`: If user.id changes, all task.user_id values update

**Example Queries:**

**Get all tasks for a user:**
```sql
SELECT * FROM tasks WHERE user_id = 'user-123';
```

**Get user with their tasks (JOIN):**
```sql
SELECT users.name, tasks.title
FROM users
LEFT JOIN tasks ON users.id = tasks.user_id
WHERE users.id = 'user-123';
```

**Count tasks per user:**
```sql
SELECT users.email, COUNT(tasks.id) AS task_count
FROM users
LEFT JOIN tasks ON users.id = tasks.user_id
GROUP BY users.id, users.email;
```

---

## Migration Strategy

### Initial Migration (Database Creation)

**Step 1: Create Database on Neon**
1. Sign up at https://neon.tech
2. Create new project
3. Copy connection string
4. Save to `DATABASE_URL` environment variable

**Step 2: Initialize Better Auth Tables**
```bash
# Better Auth automatically creates users table on first run
# No manual migration needed
```

**Step 3: Create tasks Table**

**Using Alembic (Recommended):**

**Install Alembic:**
```bash
pip install alembic
```

**Initialize Alembic:**
```bash
alembic init alembic
```

**Configure `alembic.ini`:**
```ini
sqlalchemy.url = postgresql://user:pass@neon.tech/db
```

**Create Migration:**
```bash
alembic revision -m "create_tasks_table"
```

**Migration File (`alembic/versions/001_create_tasks_table.py`):**
```python
"""create_tasks_table

Revision ID: 001
Create Date: 2026-01-03
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    """Create tasks table with indexes and constraints."""
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.Text(), nullable=False),
        sa.Column('title', sa.VARCHAR(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', onupdate='CASCADE'),
    )

    # Create indexes
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_user_completed', 'tasks', ['user_id', 'completed'])
    op.create_index('idx_tasks_user_created', 'tasks', ['user_id', sa.text('created_at DESC')])

def downgrade():
    """Drop tasks table."""
    op.drop_index('idx_tasks_user_created', 'tasks')
    op.drop_index('idx_tasks_user_completed', 'tasks')
    op.drop_index('idx_tasks_user_id', 'tasks')
    op.drop_table('tasks')
```

**Run Migration:**
```bash
alembic upgrade head
```

**Alternative: SQLModel Auto-Create (Development Only)**
```python
from sqlmodel import create_engine, SQLModel

DATABASE_URL = "postgresql://user:pass@neon.tech/db"
engine = create_engine(DATABASE_URL)

# Create all tables
SQLModel.metadata.create_all(engine)
```

**⚠️ Warning:** Auto-create is NOT recommended for production (use Alembic)

---

## Data Types and Validation

### PostgreSQL Data Types

| Column | PostgreSQL Type | Python Type | Notes |
|--------|----------------|-------------|-------|
| `id` (tasks) | SERIAL | int | Auto-incrementing integer |
| `id` (users) | TEXT | str | UUID or string from Better Auth |
| `user_id` | TEXT | str | Matches users.id type |
| `title` | VARCHAR(200) | str | Fixed maximum length |
| `description` | TEXT | str | Unlimited length |
| `completed` | BOOLEAN | bool | True/False |
| `created_at` | TIMESTAMP | datetime | UTC timestamp |
| `updated_at` | TIMESTAMP | datetime | UTC timestamp |

### Validation Layers

**Layer 1: Database Constraints**
```sql
-- NOT NULL: Cannot be empty
user_id TEXT NOT NULL

-- Length limit (enforced by VARCHAR)
title VARCHAR(200) NOT NULL

-- CHECK constraint (optional)
CHECK (char_length(title) >= 1)
```

**Layer 2: SQLModel Validation**
```python
class TaskDB(SQLModel, table=True):
    title: str = Field(max_length=200)  # Pydantic validates length
    description: Optional[str] = Field(default="")  # Optional field
    completed: bool = Field(default=False)  # Boolean validation
```

**Layer 3: Domain Entity Validation (Phase I - UNCHANGED)**
```python
class Task:
    def _validate_title(self, title: str) -> None:
        if not title or len(title) == 0:
            raise ValidationError("Title is required")
        if len(title) > 200:
            raise ValidationError("Title cannot exceed 200 characters")
```

**Defense in Depth:** Validation at every layer ensures data integrity

---

## Appendix: Database Queries Reference

### Common Query Patterns

**1. Get all tasks for user:**
```sql
SELECT * FROM tasks
WHERE user_id = $1
ORDER BY created_at DESC;
```

**2. Get single task by ID and user:**
```sql
SELECT * FROM tasks
WHERE id = $1 AND user_id = $2;
```

**3. Create task:**
```sql
INSERT INTO tasks (user_id, title, description, completed, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW(), NOW())
RETURNING *;
```

**4. Update task:**
```sql
UPDATE tasks
SET title = $1,
    description = $2,
    updated_at = NOW()
WHERE id = $3 AND user_id = $4
RETURNING *;
```

**5. Delete task:**
```sql
DELETE FROM tasks
WHERE id = $1 AND user_id = $2;
```

**6. Toggle completion:**
```sql
UPDATE tasks
SET completed = $1,
    updated_at = NOW()
WHERE id = $2 AND user_id = $3
RETURNING *;
```

**7. Filter by completion status:**
```sql
SELECT * FROM tasks
WHERE user_id = $1 AND completed = $2
ORDER BY created_at DESC;
```

**8. Count tasks by user:**
```sql
SELECT
    user_id,
    COUNT(*) AS total_tasks,
    COUNT(CASE WHEN completed = TRUE THEN 1 END) AS completed_tasks,
    COUNT(CASE WHEN completed = FALSE THEN 1 END) AS pending_tasks
FROM tasks
GROUP BY user_id;
```

---

## Appendix: Connection Pooling

### Why Connection Pooling?

PostgreSQL has connection limits. Creating new connections for every request is slow and wasteful.

### SQLModel + PostgreSQL Connection Pool

**Using SQLAlchemy Engine:**
```python
from sqlmodel import create_engine
from sqlalchemy.pool import QueuePool

DATABASE_URL = "postgresql://user:pass@neon.tech/db"

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,          # Keep 5 connections ready
    max_overflow=10,      # Allow up to 10 additional connections
    pool_timeout=30,      # Wait 30s for connection
    pool_recycle=3600,    # Recycle connections after 1 hour
    echo=False            # Set to True for SQL logging
)
```

**Connection Pool Settings:**
- `pool_size=5`: Keep 5 persistent connections
- `max_overflow=10`: Can create 10 more if needed (total 15)
- `pool_timeout=30`: Wait up to 30 seconds for available connection
- `pool_recycle=3600`: Refresh connections every hour (prevents stale connections)

### Neon Auto-Scaling

Neon automatically scales compute based on load. No manual intervention needed.

---

## Appendix: Backup and Recovery

### Neon Automatic Backups

**Neon provides:**
- Continuous backups (every write is backed up)
- Point-in-time recovery (restore to any second)
- Retention: 7 days (free tier) / 30 days (paid)

**Recovery Process:**
1. Go to Neon Console
2. Select "Restore" from project settings
3. Choose timestamp to restore to
4. Neon creates new branch with restored data

**No manual backup scripts needed!**

---

**Document Status:** Complete
**Dependencies:** features/task-crud.md, features/task-ownership.md, overview.md
**Related Specs:** api/rest-endpoints.md
**Implementation:** Not started (spec-only phase)

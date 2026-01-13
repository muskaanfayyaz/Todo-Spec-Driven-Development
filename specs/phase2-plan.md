# Phase II Technical Implementation Plan

**Version:** 1.0
**Date:** January 3, 2026
**Status:** Pre-Implementation Planning
**Methodology:** Spec-Kit Plus (Spec-Driven Development)
**AI Tool:** Claude Code (Sonnet 4.5)

---

## Document Purpose

This document serves as the **master execution plan** for implementing Phase II of the Todo application. It is created **BEFORE any code is written** to ensure:

1. **Spec-First Approach**: All implementation decisions are driven by specifications
2. **Dependency Management**: Components are built in the correct order
3. **Risk Mitigation**: Potential issues are identified and addressed proactively
4. **Phase I Preservation**: Clean Architecture from Phase I remains intact
5. **Validation Gates**: Each phase has clear success criteria before proceeding

**Critical Constraint**: This plan MUST be followed exactly. No implementation may proceed until the previous phase is complete and validated.

---

## Table of Contents

1. [Specification Review](#specification-review)
2. [Architecture Migration Strategy](#architecture-migration-strategy)
3. [Dependency Chain Analysis](#dependency-chain-analysis)
4. [Phase-Wise Execution Plan](#phase-wise-execution-plan)
5. [Backend Implementation Sequence](#backend-implementation-sequence)
6. [Frontend Implementation Sequence](#frontend-implementation-sequence)
7. [Authentication Integration Sequence](#authentication-integration-sequence)
8. [Validation Checkpoints](#validation-checkpoints)
9. [Risk Analysis and Mitigations](#risk-analysis-and-mitigations)
10. [Implementation Timeline](#implementation-timeline)

---

## Specification Review

### Specification Inventory

Before implementation begins, verify all required specifications exist and are complete:

| Specification | Location | Status | Lines | Purpose |
|---------------|----------|--------|-------|---------|
| **System Overview** | `specs/overview.md` | ✅ Complete | ~650 | Full-stack architecture, flows, tech stack |
| **Task CRUD** | `specs/features/task-crud.md` | ✅ Complete | ~700 | CRUD operations, use cases, validation |
| **Authentication** | `specs/features/authentication.md` | ✅ Complete | ~750 | JWT, Better Auth, security |
| **Task Ownership** | `specs/features/task-ownership.md` | ✅ Complete | ~650 | Multi-user isolation, authorization |
| **REST API** | `specs/api/rest-endpoints.md` | ✅ Complete | ~850 | All endpoints, contracts, errors |
| **Database Schema** | `specs/database/schema.md` | ✅ Complete | ~700 | PostgreSQL tables, indexes, migrations |
| **UI Pages** | `specs/ui/pages.md` | ✅ Complete | ~850 | Pages, layouts, user flows |
| **UI Components** | `specs/ui/components.md` | ✅ Complete | ~750 | React components, props, state |
| **Constitution** | `CONSTITUTION_PHASE2.md` | ✅ Complete | ~1,100 | Governance, constraints, rules |

**Total Specification Coverage:** ~6,900 lines across 9 documents

### Specification Validation Checklist

Before proceeding with implementation, confirm:

- [ ] All specifications reviewed and approved
- [ ] No conflicting requirements identified
- [ ] All dependencies between specs documented
- [ ] Phase I compatibility verified
- [ ] Constitution compliance confirmed
- [ ] Technology stack finalized
- [ ] Environment variables documented
- [ ] Security requirements understood

**⚠️ GATE 1**: Do NOT proceed to implementation until all checkboxes are complete.

---

## Architecture Migration Strategy

### Phase I → Phase II Transition

#### What MUST NOT Change (Phase I Preservation)

**Critical Constraint**: The following Phase I components MUST remain **100% unchanged**:

```
Phase I Components (FROZEN):
├── domain/
│   ├── entities/task.py          ❌ NO CHANGES ALLOWED
│   ├── value_objects/            ❌ NO CHANGES ALLOWED
│   └── exceptions.py             ❌ NO CHANGES ALLOWED
└── application/
    └── use_cases/                ❌ NO CHANGES ALLOWED
        ├── add_task.py
        ├── list_tasks.py
        ├── update_task.py
        ├── delete_task.py
        ├── complete_task.py
        └── uncomplete_task.py
```

**Validation Test**: After Phase II implementation, we MUST be able to:
```bash
# Compare Phase I and Phase II domain/application layers
diff -r phase1/src/domain phase2/backend/app/domain
diff -r phase1/src/application phase2/backend/app/application

# Expected result: NO DIFFERENCES
```

#### What WILL Change (New Infrastructure)

**Phase II New Components:**

```
Phase II Components (NEW):
├── backend/
│   ├── app/
│   │   ├── domain/              ← COPIED from Phase I (unchanged)
│   │   ├── application/         ← COPIED from Phase I (unchanged)
│   │   ├── infrastructure/      ← NEW: PostgreSQL Repository
│   │   │   └── repositories/
│   │   │       └── postgres_task_repository.py
│   │   └── presentation/        ← NEW: REST API
│   │       ├── api/
│   │       │   ├── routes/
│   │       │   │   └── tasks.py
│   │       │   └── dependencies/
│   │       │       └── auth.py
│   │       └── main.py
│   └── requirements.txt
└── frontend/
    ├── app/                     ← NEW: Next.js App Router
    ├── components/              ← NEW: React Components
    └── lib/                     ← NEW: Auth & API utilities
```

### Migration Steps

**Step 1: Copy Phase I Core**
```bash
# Copy domain and application layers (NO MODIFICATIONS)
cp -r phase1/src/domain phase2/backend/app/domain
cp -r phase1/src/application phase2/backend/app/application
```

**Step 2: Create New Infrastructure**
- Implement PostgreSQL repository (replaces in-memory)
- Repository MUST implement same interface as Phase I
- All queries MUST include user_id filtering

**Step 3: Create New Presentation**
- Implement FastAPI REST endpoints
- Wire use cases (unchanged) to API routes
- Add JWT authentication middleware

**Step 4: Validate Compatibility**
```python
# Use cases should work identically
from app.application.use_cases.add_task import AddTaskUseCase
from app.infrastructure.repositories.postgres_task_repository import PostgreSQLTaskRepository

# Same interface, different implementation
repository = PostgreSQLTaskRepository(db_session, user_id="user-123")
use_case = AddTaskUseCase(repository)
task = use_case.execute(title="Test", description="Test")  # ✅ Should work
```

---

## Dependency Chain Analysis

### Critical Dependencies

#### Dependency Graph

```
External Dependencies:
├── Neon Database (MUST exist before backend)
│   └── Better Auth Tables (MUST exist before auth integration)
│       └── Tasks Table (MUST exist before backend testing)
│           └── Backend API (MUST work before frontend)
│               └── Frontend Application (depends on working API)
```

#### Detailed Dependency Chain

**Level 1: Database (Foundation)**
```
Neon PostgreSQL Database
├── Create project on Neon
├── Obtain DATABASE_URL
├── Configure connection pooling
└── CHECKPOINT: Can connect to database ✓
```

**Level 2: Better Auth Setup**
```
Better Auth (on Database)
├── Install Better Auth in Next.js
├── Configure BETTER_AUTH_SECRET
├── Run Better Auth migration (creates users table)
└── CHECKPOINT: Users table exists ✓
```

**Level 3: Tasks Table Creation**
```
Tasks Table (depends on Users Table)
├── Create Alembic migration
├── Define tasks table with user_id FK
├── Run migration
└── CHECKPOINT: Tasks table exists with FK to users ✓
```

**Level 4: Backend Repository**
```
PostgreSQL Repository (depends on Tasks Table)
├── Copy Phase I domain/application (unchanged)
├── Implement PostgreSQLTaskRepository
├── Wire repository to use cases
└── CHECKPOINT: Repository can CRUD tasks ✓
```

**Level 5: Backend API**
```
FastAPI Presentation Layer (depends on Repository)
├── Implement JWT verification middleware
├── Create task endpoints (GET, POST, PUT, DELETE, PATCH)
├── Wire endpoints to use cases
└── CHECKPOINT: API responds to requests ✓
```

**Level 6: Frontend**
```
Next.js Application (depends on Backend API)
├── Set up Next.js App Router
├── Integrate Better Auth (frontend)
├── Create pages (login, signup, tasks)
├── Create components (TaskList, TaskItem, etc.)
└── CHECKPOINT: Full application works end-to-end ✓
```

### Parallel vs Sequential Work

**Can Be Done in Parallel:**
- ❌ NONE - All work is sequential due to dependencies

**Must Be Sequential:**
- ✅ Database → Backend → Frontend (strict order)
- ✅ Better Auth → Tasks Table (FK dependency)
- ✅ Repository → API → UI (layer dependency)

**Rationale**: We follow a **bottom-up approach** because higher layers depend on lower layers being complete and tested.

---

## Phase-Wise Execution Plan

### Overview of Phases

| Phase | Focus | Duration Est. | Validation Gate |
|-------|-------|--------------|-----------------|
| **Phase 0** | Environment Setup | ~1 hour | Database connection works |
| **Phase 1** | Database Schema | ~1 hour | Tables created, queryable |
| **Phase 2** | Backend Infrastructure | ~2 hours | Repository CRUD works |
| **Phase 3** | Backend API | ~2 hours | All endpoints return correct responses |
| **Phase 4** | Authentication Integration | ~2 hours | JWT verification works |
| **Phase 5** | Frontend Pages | ~2 hours | All pages render |
| **Phase 6** | Frontend Components | ~2 hours | All interactions work |
| **Phase 7** | End-to-End Testing | ~1 hour | Full user flows work |
| **Phase 8** | Deployment | ~1 hour | Production deployment successful |

**Total Estimated Time:** ~14 hours (assumes no major issues)

---

## Backend Implementation Sequence

### Phase 0: Environment Setup

**Objective**: Prepare development environment and external services

**Tasks**:
1. Create Neon PostgreSQL project
   - Sign up at neon.tech
   - Create new project: "todo-app-phase2"
   - Copy DATABASE_URL from Neon dashboard
   - Save to `.env` file

2. Set up Python environment
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   ```

3. Install dependencies
   ```bash
   pip install fastapi uvicorn sqlmodel psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-dotenv
   pip freeze > requirements.txt
   ```

4. Create `.env` file
   ```bash
   DATABASE_URL=postgresql://user:pass@neon.tech/todo_phase2
   BETTER_AUTH_SECRET=<generate-32-byte-secret>
   ALLOWED_ORIGINS=http://localhost:3000
   ```

**Validation Gate**:
```python
# Test database connection
from sqlmodel import create_engine
import os

engine = create_engine(os.getenv("DATABASE_URL"))
with engine.connect() as conn:
    result = conn.execute("SELECT 1")
    print("Database connection successful!")  # ✅ Must print this
```

**Deliverables**:
- [ ] Neon project created
- [ ] DATABASE_URL obtained and saved
- [ ] Python environment set up
- [ ] Dependencies installed
- [ ] Database connection verified

---

### Phase 1: Database Schema

**Objective**: Create PostgreSQL tables with proper constraints and indexes

**Dependencies**: Phase 0 complete ✓

**Tasks**:

1. **Set up Alembic**
   ```bash
   pip install alembic
   alembic init alembic
   ```

2. **Configure Alembic**
   - Edit `alembic.ini`: Set `sqlalchemy.url` to DATABASE_URL
   - Edit `alembic/env.py`: Import SQLModel metadata

3. **Wait for Better Auth to create users table**
   - This happens automatically when Better Auth runs first time
   - We'll verify users table exists before creating tasks table

4. **Create tasks table migration**
   ```bash
   alembic revision -m "create_tasks_table"
   ```

5. **Write migration** (following `specs/database/schema.md`):
   ```python
   def upgrade():
       op.create_table(
           'tasks',
           sa.Column('id', sa.Integer(), primary_key=True),
           sa.Column('user_id', sa.Text(), nullable=False),
           sa.Column('title', sa.VARCHAR(200), nullable=False),
           sa.Column('description', sa.Text(), nullable=True),
           sa.Column('completed', sa.Boolean(), server_default='false'),
           sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
           sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('NOW()')),
           sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
       )

       # Create indexes
       op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
       op.create_index('idx_tasks_user_completed', 'tasks', ['user_id', 'completed'])
   ```

6. **Run migration**
   ```bash
   alembic upgrade head
   ```

**Validation Gate**:
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
-- Expected: users, tasks

-- Verify indexes exist
SELECT indexname FROM pg_indexes
WHERE tablename = 'tasks';
-- Expected: idx_tasks_user_id, idx_tasks_user_completed

-- Verify foreign key constraint
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'tasks' AND constraint_type = 'FOREIGN KEY';
-- Expected: fk_user
```

**Deliverables**:
- [ ] Alembic configured
- [ ] users table exists (created by Better Auth)
- [ ] tasks table created with correct schema
- [ ] Indexes created
- [ ] Foreign key constraint verified
- [ ] Migration is reversible (`alembic downgrade -1` works)

---

### Phase 2: Backend Infrastructure Layer

**Objective**: Implement PostgreSQL repository that works with Phase I use cases

**Dependencies**: Phase 1 complete ✓

**Specification Reference**: `specs/database/schema.md`, `specs/features/task-ownership.md`

**Tasks**:

1. **Copy Phase I domain and application layers**
   ```bash
   mkdir -p backend/app
   cp -r ../src/domain backend/app/domain
   cp -r ../src/application backend/app/application
   ```

2. **Create SQLModel database model** (`backend/app/infrastructure/models/task_db.py`)
   ```python
   from sqlmodel import SQLModel, Field
   from datetime import datetime
   from typing import Optional

   class TaskDB(SQLModel, table=True):
       __tablename__ = "tasks"

       id: Optional[int] = Field(default=None, primary_key=True)
       user_id: str = Field(foreign_key="users.id", index=True)
       title: str = Field(max_length=200)
       description: Optional[str] = Field(default="")
       completed: bool = Field(default=False)
       created_at: datetime = Field(default_factory=datetime.utcnow)
       updated_at: datetime = Field(default_factory=datetime.utcnow)
   ```

3. **Implement PostgreSQL Repository** (`backend/app/infrastructure/repositories/postgres_task_repository.py`)

   **Critical Requirements**:
   - MUST implement same interface as Phase I `TaskRepository`
   - MUST automatically filter all queries by `user_id`
   - MUST convert between `TaskDB` (infrastructure) and `Task` (domain)

   ```python
   from sqlmodel import Session, select
   from app.application.interfaces.task_repository import TaskRepository
   from app.domain.entities.task import Task
   from app.domain.value_objects.task_status import TaskStatus
   from app.infrastructure.models.task_db import TaskDB
   from typing import List, Optional

   class PostgreSQLTaskRepository(TaskRepository):
       """
       PostgreSQL implementation of TaskRepository.

       CRITICAL: This repository is scoped to a specific user_id.
       All queries automatically filter by user_id for security.
       """

       def __init__(self, session: Session, user_id: str):
           self.session = session
           self.user_id = user_id  # User context for all operations

       def add(self, task: Task) -> Task:
           """Add task with automatic user_id assignment."""
           db_task = TaskDB(
               user_id=self.user_id,  # Automatically set
               title=task.title,
               description=task.description,
               completed=task.is_completed,
           )
           self.session.add(db_task)
           self.session.commit()
           self.session.refresh(db_task)
           return self._to_domain(db_task)

       def get_by_id(self, task_id: int) -> Optional[Task]:
           """Get task ONLY if it belongs to user."""
           statement = select(TaskDB).where(
               TaskDB.id == task_id,
               TaskDB.user_id == self.user_id  # Security filter
           )
           db_task = self.session.exec(statement).first()
           return self._to_domain(db_task) if db_task else None

       def get_all(self) -> List[Task]:
           """Get all tasks for this user ONLY."""
           statement = select(TaskDB).where(
               TaskDB.user_id == self.user_id  # Security filter
           ).order_by(TaskDB.created_at.desc())
           db_tasks = self.session.exec(statement).all()
           return [self._to_domain(t) for t in db_tasks]

       def update(self, task: Task) -> Task:
           """Update task ONLY if it belongs to user."""
           statement = select(TaskDB).where(
               TaskDB.id == task.id,
               TaskDB.user_id == self.user_id  # Security filter
           )
           db_task = self.session.exec(statement).first()
           if not db_task:
               raise TaskNotFoundError(f"Task {task.id} not found")

           db_task.title = task.title
           db_task.description = task.description
           db_task.completed = task.is_completed
           db_task.updated_at = datetime.utcnow()

           self.session.add(db_task)
           self.session.commit()
           self.session.refresh(db_task)
           return self._to_domain(db_task)

       def delete(self, task_id: int) -> None:
           """Delete task ONLY if it belongs to user."""
           statement = select(TaskDB).where(
               TaskDB.id == task_id,
               TaskDB.user_id == self.user_id  # Security filter
           )
           db_task = self.session.exec(statement).first()
           if not db_task:
               raise TaskNotFoundError(f"Task {task.id} not found")

           self.session.delete(db_task)
           self.session.commit()

       def _to_domain(self, db_task: TaskDB) -> Task:
           """Convert database model to domain entity."""
           status = TaskStatus.COMPLETED if db_task.completed else TaskStatus.PENDING
           return Task(
               id=db_task.id,
               title=db_task.title,
               description=db_task.description,
               status=status,
               created_at=db_task.created_at
           )
   ```

4. **Create database session dependency**
   ```python
   # backend/app/infrastructure/database.py
   from sqlmodel import create_engine, Session
   import os

   DATABASE_URL = os.getenv("DATABASE_URL")
   engine = create_engine(DATABASE_URL, echo=True)

   def get_session():
       with Session(engine) as session:
           yield session
   ```

**Validation Gate**:
```python
# Test script: test_repository.py
from app.infrastructure.repositories.postgres_task_repository import PostgreSQLTaskRepository
from app.infrastructure.database import get_session
from app.application.use_cases.add_task import AddTaskUseCase
from app.application.use_cases.list_tasks import ListTasksUseCase

session = next(get_session())

# Test with user-scoped repository
repo_user_a = PostgreSQLTaskRepository(session, "user-A")
repo_user_b = PostgreSQLTaskRepository(session, "user-B")

# User A adds task
use_case_a = AddTaskUseCase(repo_user_a)
task_a = use_case_a.execute("User A's task", "Description")
print(f"Created task {task_a.id} for User A")

# User B adds task
use_case_b = AddTaskUseCase(repo_user_b)
task_b = use_case_b.execute("User B's task", "Description")
print(f"Created task {task_b.id} for User B")

# User A lists tasks - should only see their task
list_use_case_a = ListTasksUseCase(repo_user_a)
tasks_a = list_use_case_a.execute()
assert len(tasks_a) == 1  # ✅ Only User A's task
assert tasks_a[0].title == "User A's task"

# User B lists tasks - should only see their task
list_use_case_b = ListTasksUseCase(repo_user_b)
tasks_b = list_use_case_b.execute()
assert len(tasks_b) == 1  # ✅ Only User B's task
assert tasks_b[0].title == "User B's task"

print("✅ Repository isolation verified!")
```

**Deliverables**:
- [ ] Phase I domain/application copied (unchanged)
- [ ] TaskDB SQLModel created
- [ ] PostgreSQLTaskRepository implemented
- [ ] Database session management configured
- [ ] Repository passes isolation test
- [ ] All Phase I use cases work with new repository

---

### Phase 3: Backend Presentation Layer (REST API)

**Objective**: Expose use cases through authenticated REST endpoints

**Dependencies**: Phase 2 complete ✓

**Specification Reference**: `specs/api/rest-endpoints.md`

**Tasks**:

1. **Create FastAPI application** (`backend/app/presentation/main.py`)
   ```python
   from fastapi import FastAPI
   from fastapi.middleware.cors import CORSMiddleware
   import os

   app = FastAPI(title="Todo API", version="1.0.0")

   # CORS configuration
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )

   @app.get("/health")
   def health_check():
       return {"status": "healthy", "version": "1.0.0"}
   ```

2. **Implement JWT verification** (`backend/app/presentation/api/dependencies/auth.py`)
   ```python
   from fastapi import Depends, HTTPException
   from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
   import jwt
   import os

   security = HTTPBearer()

   def get_current_user(
       credentials: HTTPAuthorizationCredentials = Depends(security)
   ) -> str:
       """
       Extract and verify JWT token, return user_id.

       This is the CRITICAL security boundary.
       All protected endpoints MUST use this dependency.
       """
       try:
           token = credentials.credentials
           payload = jwt.decode(
               token,
               os.getenv("BETTER_AUTH_SECRET"),
               algorithms=["HS256"]
           )
           user_id = payload.get("sub")
           if not user_id:
               raise HTTPException(401, "Invalid token: missing subject")
           return user_id
       except jwt.ExpiredSignatureError:
           raise HTTPException(401, "Token expired")
       except jwt.InvalidTokenError:
           raise HTTPException(401, "Invalid token")
   ```

3. **Create task routes** (`backend/app/presentation/api/routes/tasks.py`)

   Following the pattern from `specs/api/rest-endpoints.md`:

   ```python
   from fastapi import APIRouter, Depends, HTTPException
   from sqlmodel import Session
   from app.infrastructure.database import get_session
   from app.infrastructure.repositories.postgres_task_repository import PostgreSQLTaskRepository
   from app.application.use_cases import *
   from app.presentation.api.dependencies.auth import get_current_user
   from pydantic import BaseModel

   router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])

   class CreateTaskRequest(BaseModel):
       title: str
       description: str = ""

   @router.get("")
   def list_tasks(
       user_id: str,
       authenticated_user_id: str = Depends(get_current_user),
       session: Session = Depends(get_session)
   ):
       """List all tasks for authenticated user."""
       # CRITICAL: Verify URL user_id matches JWT user_id
       if user_id != authenticated_user_id:
           raise HTTPException(403, "Forbidden: Cannot access another user's tasks")

       # Create user-scoped repository
       repository = PostgreSQLTaskRepository(session, authenticated_user_id)
       use_case = ListTasksUseCase(repository)
       tasks = use_case.execute()

       return [
           {
               "id": t.id,
               "title": t.title,
               "description": t.description,
               "completed": t.is_completed,
               "created_at": t.created_at.isoformat(),
               "updated_at": t.created_at.isoformat()  # Simplified
           }
           for t in tasks
       ]

   @router.post("", status_code=201)
   def create_task(
       user_id: str,
       request: CreateTaskRequest,
       authenticated_user_id: str = Depends(get_current_user),
       session: Session = Depends(get_session)
   ):
       """Create new task for authenticated user."""
       if user_id != authenticated_user_id:
           raise HTTPException(403, "Forbidden")

       repository = PostgreSQLTaskRepository(session, authenticated_user_id)
       use_case = AddTaskUseCase(repository)

       try:
           task = use_case.execute(request.title, request.description)
           return {
               "id": task.id,
               "title": task.title,
               "description": task.description,
               "completed": task.is_completed,
               "created_at": task.created_at.isoformat(),
               "updated_at": task.created_at.isoformat()
           }
       except ValidationError as e:
           raise HTTPException(400, str(e))

   # ... similar implementations for PUT, DELETE, PATCH endpoints
   ```

4. **Wire routes to main app**
   ```python
   # In backend/app/presentation/main.py
   from app.presentation.api.routes import tasks

   app.include_router(tasks.router)
   ```

**Validation Gate**:
```bash
# Start server
uvicorn app.presentation.main:app --reload

# Test health endpoint
curl http://localhost:8000/health
# Expected: {"status": "healthy", "version": "1.0.0"}

# Test unauthenticated request (should fail)
curl http://localhost:8000/api/user-123/tasks
# Expected: 401 Unauthorized

# Test with fake JWT (should fail)
curl -H "Authorization: Bearer fake-token" http://localhost:8000/api/user-123/tasks
# Expected: 401 Invalid token

# After Better Auth is set up in Phase 4:
# Test with real JWT (should succeed)
curl -H "Authorization: Bearer <real-jwt>" http://localhost:8000/api/user-123/tasks
# Expected: [] (empty task list initially)
```

**Deliverables**:
- [ ] FastAPI application created
- [ ] CORS configured
- [ ] Health endpoint works
- [ ] JWT verification middleware implemented
- [ ] All 7 task endpoints implemented
- [ ] URL user_id vs JWT user_id verification works
- [ ] Endpoints return correct status codes
- [ ] Error responses match specification format

---

### Phase 4: Authentication Integration (Backend)

**Objective**: Integrate with Better Auth JWT tokens

**Dependencies**: Phase 3 complete ✓, Better Auth running (frontend)

**Specification Reference**: `specs/features/authentication.md`

**Tasks**:

1. **Verify BETTER_AUTH_SECRET is set**
   ```bash
   # Both frontend and backend MUST use same secret
   echo $BETTER_AUTH_SECRET
   # Should output a 32+ character string
   ```

2. **Test JWT generation** (from Better Auth on frontend)
   - After frontend Better Auth is configured, register a test user
   - Capture the JWT token from browser dev tools
   - Decode it at jwt.io to verify structure

3. **Test JWT verification** (in backend)
   ```python
   # Test script
   import jwt
   import os

   test_token = "<paste-token-from-better-auth>"
   secret = os.getenv("BETTER_AUTH_SECRET")

   try:
       payload = jwt.decode(test_token, secret, algorithms=["HS256"])
       print(f"✅ Token verified! User ID: {payload['sub']}")
   except jwt.InvalidTokenError as e:
       print(f"❌ Token verification failed: {e}")
   ```

4. **Integration test: End-to-end request**
   ```bash
   # 1. Register user on frontend (get JWT)
   # 2. Use JWT to create task via API

   curl -X POST http://localhost:8000/api/user-123/tasks \
     -H "Authorization: Bearer <jwt-from-better-auth>" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test task", "description": "Integration test"}'

   # Expected: 201 Created with task JSON
   ```

**Validation Gate**:
- [ ] BETTER_AUTH_SECRET matches between frontend and backend
- [ ] JWT tokens from Better Auth can be decoded
- [ ] JWT verification in backend works
- [ ] End-to-end request (frontend → API → database) succeeds
- [ ] User isolation verified (User A cannot see User B's tasks)

**Deliverables**:
- [ ] Shared secret configured
- [ ] JWT verification tested and working
- [ ] Integration test passes
- [ ] Security verified (cross-user access blocked)

---

## Frontend Implementation Sequence

### Phase 5: Frontend Foundation

**Objective**: Set up Next.js with Better Auth and basic routing

**Dependencies**: Backend Phase 4 complete ✓

**Specification Reference**: `specs/ui/pages.md`

**Tasks**:

1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install better-auth
   npm install -D @types/node
   ```

3. **Configure environment variables** (`.env.local`)
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   BETTER_AUTH_SECRET=<same-secret-as-backend>
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. **Set up Better Auth** (`lib/auth.ts`)
   ```typescript
   import { createAuthClient } from "better-auth/client";

   export const authClient = createAuthClient({
     baseURL: process.env.BETTER_AUTH_URL,
     session: {
       strategy: "jwt",
       expiresIn: 3600, // 1 hour
     },
     jwt: {
       secret: process.env.BETTER_AUTH_SECRET!,
       algorithm: "HS256",
     },
   });

   export async function getSession() {
     return await authClient.getSession();
   }
   ```

5. **Create App Router structure**
   ```
   app/
   ├── (auth)/
   │   ├── login/
   │   │   └── page.tsx
   │   └── signup/
   │       └── page.tsx
   ├── (protected)/
   │   └── tasks/
   │       └── page.tsx
   ├── layout.tsx
   ├── page.tsx (landing - redirects)
   └── globals.css
   ```

6. **Implement middleware for route protection**
   ```typescript
   // middleware.ts
   import { NextResponse } from 'next/server';
   import type { NextRequest } from 'next/server';
   import { getSession } from '@/lib/auth';

   export async function middleware(request: NextRequest) {
     const session = await getSession();
     const { pathname } = request.nextUrl;

     // Protected routes
     if (pathname.startsWith('/tasks')) {
       if (!session) {
         return NextResponse.redirect(new URL('/login', request.url));
       }
     }

     // Auth routes (redirect if already logged in)
     if (pathname === '/login' || pathname === '/signup') {
       if (session) {
         return NextResponse.redirect(new URL('/tasks', request.url));
       }
     }

     return NextResponse.next();
   }
   ```

**Validation Gate**:
```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Expected: Redirect to /login

# Check middleware
# Visit /tasks without login
# Expected: Redirect to /login

# Check Better Auth
# Visit /login
# Expected: Login page renders
```

**Deliverables**:
- [ ] Next.js project initialized
- [ ] Better Auth configured
- [ ] Environment variables set
- [ ] Middleware configured and tested
- [ ] Route structure created
- [ ] Redirects work correctly

---

### Phase 6: Authentication Pages

**Objective**: Implement login and signup pages

**Dependencies**: Phase 5 complete ✓

**Specification Reference**: `specs/ui/pages.md` (Login, Signup sections)

**Tasks**:

1. **Implement Login Page** (`app/(auth)/login/page.tsx`)
   ```typescript
   'use client';

   import { useState } from 'react';
   import { useRouter } from 'next/navigation';
   import { authClient } from '@/lib/auth';
   import Link from 'next/link';

   export default function LoginPage() {
     const router = useRouter();
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);

     async function handleSubmit(e: React.FormEvent) {
       e.preventDefault();
       setLoading(true);
       setError('');

       try {
         const { data, error } = await authClient.signIn({ email, password });

         if (error) {
           setError('Invalid email or password');
           return;
         }

         router.push('/tasks');
       } catch (err) {
         setError('An error occurred. Please try again.');
       } finally {
         setLoading(false);
       }
     }

     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
           <h1 className="text-2xl font-bold mb-6">Login to Todo App</h1>

           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-1">Email</label>
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 className="w-full px-3 py-2 border rounded-md"
               />
             </div>

             <div>
               <label className="block text-sm font-medium mb-1">Password</label>
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 className="w-full px-3 py-2 border rounded-md"
               />
             </div>

             {error && <p className="text-red-500 text-sm">{error}</p>}

             <button
               type="submit"
               disabled={loading}
               className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
             >
               {loading ? 'Logging in...' : 'Login'}
             </button>
           </form>

           <p className="mt-4 text-center text-sm">
             Don't have an account?{' '}
             <Link href="/signup" className="text-blue-600 hover:underline">
               Sign up
             </Link>
           </p>
         </div>
       </div>
     );
   }
   ```

2. **Implement Signup Page** (similar to login, using `authClient.signUp`)

3. **Test authentication flow**

**Validation Gate**:
- [ ] Login page renders
- [ ] Signup page renders
- [ ] Can register new user
- [ ] Registration creates user in database
- [ ] Can login with credentials
- [ ] Login returns JWT token
- [ ] After login, redirected to /tasks
- [ ] Logout clears session and redirects to /login

**Deliverables**:
- [ ] Login page implemented
- [ ] Signup page implemented
- [ ] Authentication flow works end-to-end
- [ ] Error handling works
- [ ] JWT token is stored correctly

---

### Phase 7: Task Management UI

**Objective**: Implement task list page with all CRUD operations

**Dependencies**: Phase 6 complete ✓, Backend API working ✓

**Specification Reference**: `specs/ui/pages.md` (Tasks Page), `specs/ui/components.md`

**Tasks**:

1. **Create API utility** (`lib/api.ts`)
   ```typescript
   export async function apiRequest(
     endpoint: string,
     options: RequestInit = {}
   ) {
     const session = await getSession();

     if (!session) {
       throw new Error('Not authenticated');
     }

     const response = await fetch(
       `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
       {
         ...options,
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${session.token}`,
           ...options.headers,
         },
       }
     );

     if (response.status === 401) {
       // Token expired
       window.location.href = '/login';
       throw new Error('Session expired');
     }

     if (!response.ok) {
       const error = await response.json();
       throw new Error(error.message || 'Request failed');
     }

     if (response.status === 204) {
       return null;
     }

     return await response.json();
   }
   ```

2. **Implement components** (following `specs/ui/components.md`):
   - TaskList.tsx
   - TaskItem.tsx
   - AddTaskForm.tsx
   - EditTaskModal.tsx
   - UI components (Button, Input, Textarea, Checkbox, Modal)

3. **Implement Tasks Page** (`app/(protected)/tasks/page.tsx`)
   ```typescript
   import { getSession } from '@/lib/auth';
   import { redirect } from 'next/navigation';
   import TaskList from '@/components/tasks/TaskList';
   import AddTaskForm from '@/components/tasks/AddTaskForm';
   import Header from '@/components/layout/Header';

   export default async function TasksPage() {
     const session = await getSession();

     if (!session) {
       redirect('/login');
     }

     // Fetch initial tasks server-side
     const response = await fetch(
       `${process.env.NEXT_PUBLIC_API_URL}/api/${session.user.id}/tasks`,
       {
         headers: {
           Authorization: `Bearer ${session.token}`,
         },
       }
     );

     const tasks = await response.json();

     return (
       <div className="min-h-screen bg-gray-50">
         <Header userName={session.user.name} />

         <main className="container mx-auto px-4 py-8 max-w-4xl">
           <AddTaskForm userId={session.user.id} token={session.token} />
           <div className="mt-8">
             <TaskList
               initialTasks={tasks}
               userId={session.user.id}
               token={session.token}
             />
           </div>
         </main>
       </div>
     );
   }
   ```

**Validation Gate**:
```
User Flow Test:
1. Register new user → ✅ Account created
2. Redirected to /tasks → ✅ Empty task list shown
3. Add task "Buy groceries" → ✅ Task appears in list
4. Mark task complete → ✅ Checkbox checked, strikethrough applied
5. Edit task title → ✅ Title updated
6. Delete task → ✅ Task removed
7. Logout → ✅ Redirected to /login
8. Login again → ✅ Tasks persist (database)

Multi-User Test:
1. User A creates 3 tasks
2. User B logs in
3. User B sees 0 tasks (isolation verified) ✅
```

**Deliverables**:
- [ ] All components implemented
- [ ] Tasks page renders
- [ ] Can add tasks
- [ ] Can view tasks
- [ ] Can edit tasks
- [ ] Can delete tasks
- [ ] Can toggle completion
- [ ] Optimistic UI updates work
- [ ] Error handling works
- [ ] Loading states work
- [ ] Multi-user isolation verified

---

## Authentication Integration Sequence

### Critical Dependencies for Auth Integration

```
Better Auth Integration Chain:

1. Generate BETTER_AUTH_SECRET
   ├── Must be 32+ bytes
   ├── Must be identical in frontend and backend
   └── CHECKPOINT: Secret generated and saved ✓

2. Backend: Configure JWT verification
   ├── Install PyJWT
   ├── Implement get_current_user dependency
   ├── Use secret to verify tokens
   └── CHECKPOINT: Can verify JWT tokens ✓

3. Frontend: Install and configure Better Auth
   ├── npm install better-auth
   ├── Create auth.ts with authClient
   ├── Use same secret for JWT generation
   └── CHECKPOINT: Can generate JWT tokens ✓

4. Frontend: Implement auth pages
   ├── Login page with authClient.signIn
   ├── Signup page with authClient.signUp
   └── CHECKPOINT: Can register and login ✓

5. Backend: Better Auth creates users table
   ├── Better Auth migration runs automatically
   ├── users table created in Neon
   └── CHECKPOINT: users table exists ✓

6. Integration: Test end-to-end auth
   ├── Register user → users table has record
   ├── Login → JWT token returned
   ├── Use JWT in API call → Verified successfully
   └── CHECKPOINT: Full auth flow works ✓
```

### Step-by-Step Auth Integration

**Step 1: Generate Shared Secret**
```bash
# Generate secure random secret
openssl rand -base64 32

# Output example: d8JjF2k9LpQ3mN5vR7sT1wX4yZ6aB8cE

# Add to BOTH .env files:
# frontend/.env.local:
BETTER_AUTH_SECRET=d8JjF2k9LpQ3mN5vR7sT1wX4yZ6aB8cE

# backend/.env:
BETTER_AUTH_SECRET=d8JjF2k9LpQ3mN5vR7sT1wX4yZ6aB8cE
```

**Step 2: Backend JWT Verification Setup**
- Already implemented in Phase 3
- Verify secret is loaded: `os.getenv("BETTER_AUTH_SECRET")`

**Step 3: Frontend Better Auth Setup**
- Already implemented in Phase 5
- Verify secret matches backend

**Step 4: Test Token Generation and Verification**
```typescript
// Frontend: After login
const { data } = await authClient.signIn({ email, password });
console.log("JWT Token:", data.token);

// Copy token and test on backend:
```

```python
# Backend: Decode and verify
import jwt
import os

token = "<paste-token-from-frontend>"
payload = jwt.decode(token, os.getenv("BETTER_AUTH_SECRET"), algorithms=["HS256"])
print(f"User ID: {payload['sub']}")  # Should print user ID
```

**Step 5: Integration Test**
```bash
# Complete flow:
# 1. Frontend: Register user
# 2. Check database: User exists in users table
# 3. Frontend: Login with credentials
# 4. Frontend: Receive JWT token
# 5. Frontend: Make API call with token
# 6. Backend: Verify token and return data
# 7. Frontend: Display data

# All steps must succeed ✅
```

---

## Validation Checkpoints

### Pre-Implementation Checkpoint

Before writing ANY code:
- [ ] All 9 specifications reviewed and approved
- [ ] Constitution compliance confirmed
- [ ] This plan reviewed and approved
- [ ] Environment variables documented
- [ ] External services (Neon) account created

### Backend Checkpoint 1 (After Phase 1: Database)

- [ ] Neon project created
- [ ] DATABASE_URL obtained
- [ ] Database connection verified
- [ ] users table exists (Better Auth)
- [ ] tasks table created
- [ ] Foreign key constraint works
- [ ] Indexes created

### Backend Checkpoint 2 (After Phase 2: Repository)

- [ ] Phase I domain/application copied unchanged
- [ ] PostgreSQLTaskRepository implemented
- [ ] Repository filters all queries by user_id
- [ ] User isolation test passes
- [ ] All Phase I use cases work with new repository

### Backend Checkpoint 3 (After Phase 3: API)

- [ ] FastAPI application running
- [ ] Health endpoint works
- [ ] All 7 endpoints implemented
- [ ] JWT verification works
- [ ] Unauthenticated requests return 401
- [ ] Fake JWT returns 401

### Backend Checkpoint 4 (After Phase 4: Auth Integration)

- [ ] BETTER_AUTH_SECRET matches frontend
- [ ] JWT from Better Auth can be verified
- [ ] End-to-end request succeeds
- [ ] Cross-user access blocked

### Frontend Checkpoint 1 (After Phase 5: Foundation)

- [ ] Next.js project initialized
- [ ] Better Auth configured
- [ ] Middleware works (route protection)
- [ ] Landing page redirects correctly

### Frontend Checkpoint 2 (After Phase 6: Auth Pages)

- [ ] Login page works
- [ ] Signup page works
- [ ] Can register and login
- [ ] JWT token stored correctly
- [ ] Logout works

### Frontend Checkpoint 3 (After Phase 7: Task UI)

- [ ] Tasks page renders
- [ ] All CRUD operations work
- [ ] Optimistic UI updates work
- [ ] Multi-user isolation verified
- [ ] Error handling works

### Final Validation

- [ ] Complete user flow test passes
- [ ] Multi-user isolation verified
- [ ] Security audit passes
- [ ] Performance requirements met
- [ ] All acceptance criteria met

---

## Risk Analysis and Mitigations

### Risk 1: Database Connection Issues

**Risk**: Cannot connect to Neon PostgreSQL

**Probability**: Medium
**Impact**: High (blocks all backend work)

**Mitigation**:
- Verify DATABASE_URL format is correct
- Test connection before proceeding
- Check firewall rules
- Verify SSL/TLS configuration
- Have backup local PostgreSQL for development

**Detection**: Connection test in Phase 0

### Risk 2: Better Auth Secret Mismatch

**Risk**: Frontend and backend use different BETTER_AUTH_SECRET

**Probability**: High
**Impact**: Critical (auth completely broken)

**Mitigation**:
- Generate secret ONCE and use in BOTH places
- Document secret generation process
- Create validation test that compares secrets
- Use environment variable validation script

**Detection**: JWT verification fails in Phase 4

### Risk 3: Phase I Code Modified

**Risk**: Domain or Application layer changed during migration

**Probability**: Medium
**Impact**: Critical (violates Constitution)

**Mitigation**:
- Use `cp` command (copy, don't move)
- Run diff comparison after implementation
- Automated test to verify no changes
- Make domain/application folders read-only

**Detection**: Diff command in validation

### Risk 4: User Data Leakage

**Risk**: User can access another user's tasks

**Probability**: Medium
**Impact**: Critical (security vulnerability)

**Mitigation**:
- Implement user_id filtering at repository level
- Add URL user_id vs JWT user_id verification
- Comprehensive isolation testing
- Security audit before deployment

**Detection**: Multi-user test in validation gates

### Risk 5: Frontend-Backend API Mismatch

**Risk**: Frontend expects different response format than API provides

**Probability**: Medium
**Impact**: Medium (features don't work)

**Mitigation**:
- Strict adherence to specs/api/rest-endpoints.md
- TypeScript interfaces match API contracts
- Integration tests
- Contract testing

**Detection**: Integration tests in Phase 7

### Risk 6: JWT Token Expiration Handling

**Risk**: User gets stuck when token expires

**Probability**: High
**Impact**: Medium (poor UX)

**Mitigation**:
- Implement token refresh mechanism
- Frontend intercepts 401 responses
- Redirect to login on expiration
- Show user-friendly message

**Detection**: Manual testing with expired token

---

## Implementation Timeline

### Estimated Duration: 14 Hours

**Assumptions**:
- Specifications are complete and approved
- Developer has access to all required services
- No major blocking issues encountered
- Work proceeds sequentially (no parallelization)

### Detailed Timeline

| Phase | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| **Phase 0** | Environment Setup | 1 hour | None |
| | - Create Neon project | 15 min | |
| | - Set up Python env | 15 min | |
| | - Install dependencies | 15 min | |
| | - Test database connection | 15 min | |
| **Phase 1** | Database Schema | 1 hour | Phase 0 ✓ |
| | - Set up Alembic | 15 min | |
| | - Create tasks migration | 30 min | |
| | - Run migration and verify | 15 min | |
| **Phase 2** | Backend Infrastructure | 2 hours | Phase 1 ✓ |
| | - Copy Phase I code | 15 min | |
| | - Create SQLModel | 30 min | |
| | - Implement repository | 1 hour | |
| | - Test isolation | 15 min | |
| **Phase 3** | Backend API | 2 hours | Phase 2 ✓ |
| | - Create FastAPI app | 30 min | |
| | - Implement JWT middleware | 30 min | |
| | - Create task endpoints | 1 hour | |
| **Phase 4** | Auth Integration (Backend) | 1 hour | Phase 3 ✓ |
| | - Configure secrets | 15 min | |
| | - Test JWT verification | 30 min | |
| | - Integration test | 15 min | |
| **Phase 5** | Frontend Foundation | 1 hour | Phase 4 ✓ |
| | - Initialize Next.js | 15 min | |
| | - Set up Better Auth | 30 min | |
| | - Configure routing | 15 min | |
| **Phase 6** | Auth Pages | 2 hours | Phase 5 ✓ |
| | - Implement login page | 45 min | |
| | - Implement signup page | 45 min | |
| | - Test auth flow | 30 min | |
| **Phase 7** | Task UI | 3 hours | Phase 6 ✓ |
| | - Create UI components | 1.5 hours | |
| | - Implement tasks page | 1 hour | |
| | - Test all operations | 30 min | |
| **Phase 8** | Final Validation | 1 hour | Phase 7 ✓ |
| | - End-to-end testing | 30 min | |
| | - Security testing | 30 min | |

**Total**: 14 hours (assumes ideal conditions)

**Buffer**: Add 50% for debugging and issues → **~21 hours realistic**

---

## Success Criteria

### Implementation Complete When:

1. **All Checkpoints Passed** ✅
   - All validation gates passed
   - No failing tests
   - No security vulnerabilities

2. **Specifications Implemented** ✅
   - Every requirement from specs implemented
   - No deviation from specifications
   - Complete traceability from spec to code

3. **Phase I Preserved** ✅
   - Domain layer unchanged (verified by diff)
   - Application layer unchanged (verified by diff)
   - Use cases work identically with new repository

4. **Multi-User Works** ✅
   - Users can register and login
   - Each user sees only their tasks
   - Cross-user access blocked
   - Data isolation verified

5. **Security Verified** ✅
   - JWT verification works
   - Authentication required for all protected routes
   - Authorization enforced at all layers
   - Attack scenarios tested and mitigated

6. **User Flows Complete** ✅
   - Registration → Login → Tasks → Logout works
   - All CRUD operations work
   - Error handling graceful
   - Performance acceptable

---

## Appendix: Command Reference

### Quick Start Commands

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.presentation.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Database
psql $DATABASE_URL  # Connect to Neon

# Testing
pytest  # Backend tests
npm test  # Frontend tests
```

### Validation Commands

```bash
# Check database connection
python -c "from sqlmodel import create_engine; import os; create_engine(os.getenv('DATABASE_URL')).connect()"

# Verify tables
psql $DATABASE_URL -c "\dt"

# Check Phase I preservation
diff -r phase1/src/domain phase2/backend/app/domain
diff -r phase1/src/application phase2/backend/app/application

# Test API
curl http://localhost:8000/health
```

---

## Document Status

**Status**: Pre-Implementation Plan
**Last Updated**: January 3, 2026
**Next Review**: After Phase 0 completion
**Maintained By**: AI Architect (Claude Code)

**Approval Required From**:
- [ ] User (Project Owner)
- [ ] Hackathon Judges (if applicable)

**Implementation May Begin When**:
- [ ] This plan is approved
- [ ] All specifications are finalized
- [ ] Resources are available (Neon account, etc.)

---

**This plan represents the COMPLETE execution strategy for Phase II implementation. All code generation MUST follow this plan exactly.**

# Backend Development Guide (Claude Code)

**Project:** Todo App - Phase II Backend
**Framework:** FastAPI
**Database:** Neon PostgreSQL with SQLModel
**Architecture:** Clean Architecture
**Status:** Scaffolding Complete

---

## Project Context

You are working on the **Backend** of a full-stack Todo application following **Spec-Kit Plus** methodology.

**Relationship to Frontend:**
- Backend and frontend are **separate services**
- Backend exposes REST API on port 8000
- Frontend consumes API with JWT authentication
- Backend does NOT serve frontend files

---

## Directory Structure

```
backend/
├── app/
│   ├── domain/          # Business entities (Phase I - UNCHANGED)
│   │   ├── entities/
│   │   ├── value_objects/
│   │   └── exceptions.py
│   ├── application/     # Use cases (Phase I - UNCHANGED)
│   │   ├── interfaces/
│   │   └── use_cases/
│   ├── infrastructure/  # Database & external services (NEW)
│   │   └── repositories/
│   ├── presentation/    # REST API endpoints (NEW)
│   │   ├── routers/
│   │   └── schemas/
│   ├── main.py         # FastAPI app entry point
│   ├── config.py       # Configuration
│   ├── database.py     # DB connection
│   └── auth.py         # JWT verification
└── tests/              # Test suite
```

---

## Architectural Rules (IMMUTABLE)

### Clean Architecture Layers

**Dependency Rule:** Outer layers depend on inner, NEVER reverse.

```
Presentation → Application → Domain
      ↓             ↓           ↑
Infrastructure ────────────────┘
```

### Layer Responsibilities

**1. Domain (Innermost - Phase I UNCHANGED)**
- Task entity with business rules
- TaskStatus value object
- Domain exceptions
- NO dependencies on outer layers
- NO framework dependencies

**2. Application (Phase I UNCHANGED)**
- Use cases: AddTask, ListTasks, UpdateTask, etc.
- TaskRepository interface (abstract)
- Orchestrates domain entities
- Framework-agnostic

**3. Infrastructure (NEW for Phase II)**
- PostgreSQLTaskRepository implements TaskRepository
- Database models (SQLModel)
- External service integrations
- Depends on Application interfaces

**4. Presentation (NEW for Phase II)**
- FastAPI routers and endpoints
- Pydantic request/response schemas
- HTTP exception handling
- Depends on Application use cases

---

## Development Rules

### 1. Spec-Driven Development

**RULE:** All code MUST be generated from specifications.

**Process:**
1. Read relevant spec from `/specs/`
2. Generate code according to spec
3. Verify against acceptance criteria
4. NEVER manually edit generated code

**Specifications:**
- `/specs/api/rest-endpoints.md` → API endpoints
- `/specs/database/schema.md` → Database models
- `/specs/features/` → Business logic
- `/specs/architecture_spec.md` → Architecture patterns

### 2. Phase I Preservation (CRITICAL)

**NEVER modify:**
- `app/domain/` - Domain entities and value objects
- `app/application/use_cases/` - Use case classes

**These are from Phase I and MUST remain unchanged.**

**What changes:**
- Repository **implementation** (InMemory → PostgreSQL)
- Entry point (CLI → FastAPI)
- User context (implicit → explicit user_id)

### 3. Multi-User Data Isolation (ABSOLUTE)

**Every database query MUST filter by user_id.**

**Pattern:**
```python
class PostgreSQLTaskRepository(TaskRepository):
    def __init__(self, session: Session, user_id: str):
        self.db = session
        self.user_id = user_id  # User context

    def get_all(self) -> List[Task]:
        # ALWAYS filter by user_id
        db_tasks = self.db.query(TaskDB).filter_by(
            user_id=self.user_id
        ).all()
        return [self._to_domain(t) for t in db_tasks]
```

**FORBIDDEN:**
```python
# ❌ WRONG - No user filtering
def get_all(self):
    return self.db.query(TaskDB).all()  # SECURITY HOLE!
```

### 4. JWT Authentication (MANDATORY)

**Every protected endpoint MUST:**
1. Verify JWT token
2. Extract user_id from token
3. Validate URL user_id matches token user_id
4. Pass user_id to repository

**Pattern:**
```python
from app.auth import get_current_user

@router.get("/api/{user_id}/tasks")
def get_tasks(
    user_id: str,
    auth_user_id: str = Depends(get_current_user)
):
    # Verify URL matches token
    if user_id != auth_user_id:
        raise HTTPException(403, "Forbidden")

    # Create user-scoped repository
    repo = PostgreSQLTaskRepository(db, auth_user_id)
    use_case = ListTasksUseCase(repo)
    return use_case.execute()
```

---

## Database Conventions

### SQLModel Models

**Naming:**
- Domain entity: `Task`
- Database model: `TaskDB`
- API schema: `TaskResponse`

**Example:**
```python
from sqlmodel import SQLModel, Field

class TaskDB(SQLModel, table=True):
    __tablename__ = "tasks"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str | None = None
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Mapping Domain ↔ Database

**Repository methods:**
```python
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

def _to_db(self, task: Task) -> TaskDB:
    """Convert domain entity to database model."""
    return TaskDB(
        id=task.id,
        user_id=self.user_id,
        title=task.title,
        description=task.description,
        completed=task.is_completed,
    )
```

---

## API Conventions

### Endpoint Structure

**URL Pattern:** `/api/{user_id}/tasks[/{task_id}]`

**Examples:**
- `GET /api/user-123/tasks` - List all tasks for user-123
- `POST /api/user-123/tasks` - Create task for user-123
- `GET /api/user-123/tasks/42` - Get task 42 (if owned by user-123)
- `DELETE /api/user-123/tasks/42` - Delete task 42 (if owned by user-123)

### Response Schemas

**Success Response:**
```python
class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime
```

**Error Response:**
```python
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: dict[str, str] | None = None
```

### HTTP Status Codes

- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid JWT
- `403 Forbidden` - User_id mismatch
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Unexpected error

---

## Security Checklist

Before deploying any endpoint:

- [ ] JWT token verification enabled
- [ ] User_id extracted from JWT
- [ ] URL user_id validated against JWT user_id
- [ ] Repository scoped to authenticated user
- [ ] All queries filter by user_id
- [ ] Error messages don't leak information
- [ ] Input validation enforced
- [ ] SQL injection prevented (SQLModel handles this)

---

## Environment Variables

**Required in `.env`:**
```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/db
BETTER_AUTH_SECRET=<32-byte-secret>
CORS_ORIGINS=["http://localhost:3000"]
DEBUG=false
```

---

## Testing

**Run tests:**
```bash
pytest
```

**Test categories:**
- Unit tests: Use cases and domain logic
- Integration tests: API endpoints with test database
- Security tests: Cross-user access prevention

---

## Common Tasks

### Add New Endpoint

1. Read spec: `/specs/api/rest-endpoints.md`
2. Create router in `app/presentation/routers/`
3. Define request/response schemas
4. Implement with JWT verification
5. Register router in `main.py`

### Add Database Model

1. Read spec: `/specs/database/schema.md`
2. Create SQLModel in `app/infrastructure/models/`
3. Create migration with Alembic
4. Implement repository
5. Map to domain entity

### Add Use Case

**DON'T.** Use cases are from Phase I and should not be modified.

If you truly need a new use case, update specs first, then regenerate.

---

## References

- **Root Constitution:** `/CONSTITUTION_PHASE2.md`
- **API Spec:** `/specs/api/rest-endpoints.md`
- **Database Spec:** `/specs/database/schema.md`
- **Feature Specs:** `/specs/features/`
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **SQLModel Docs:** https://sqlmodel.tiangolo.com

---

**Remember:** Domain and Application layers are IMMUTABLE. Only Infrastructure and Presentation change for Phase II.

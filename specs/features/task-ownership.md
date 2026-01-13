# Feature Specification: Task Ownership Enforcement

**Version:** 1.0
**Date:** January 3, 2026
**Feature:** Multi-User Data Isolation and Task Ownership
**Status:** Specification

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Security Principles](#security-principles)
3. [Ownership Model](#ownership-model)
4. [Enforcement Layers](#enforcement-layers)
5. [Authorization Rules](#authorization-rules)
6. [Attack Scenarios and Mitigations](#attack-scenarios-and-mitigations)
7. [Testing Strategy](#testing-strategy)
8. [Acceptance Criteria](#acceptance-criteria)

---

## Feature Overview

### Purpose

Ensure **complete data isolation** between users by enforcing task ownership at every layer of the application. No user should ever be able to view, modify, or delete another user's tasks under any circumstances.

### Scope

**In Scope:**
- Database-level ownership (foreign keys)
- Application-level filtering (repository queries)
- API-level authorization (endpoint guards)
- Frontend-level security (UI restrictions)
- Cross-user attack prevention
- Audit logging

**Out of Scope:**
- Task sharing between users (future feature)
- Group tasks or team workspaces
- Task delegation
- Administrative override (future feature)

### Critical Success Criterion

**Zero Data Leakage:** Users MUST NOT be able to access other users' data through any vector:
- Direct API calls
- URL manipulation
- Token manipulation
- SQL injection
- IDOR (Insecure Direct Object Reference)
- Race conditions
- Error message leaks

---

## Security Principles

### Principle 1: Defense in Depth

**Implementation:** Security at EVERY layer, not just one

```
Layer 1: Frontend (UI restrictions) ← First line of defense
Layer 2: API Gateway (Authorization checks) ← Primary security
Layer 3: Application (Use Case validation) ← Business rules
Layer 4: Repository (Query filtering) ← Data access control
Layer 5: Database (Foreign keys, constraints) ← Last resort
```

**Rationale:** If one layer fails, others still protect data

### Principle 2: Zero Trust

**Implementation:** Verify everything, trust nothing from client

```
❌ WRONG - Trust client
if request.user_id == "user-123":
    return tasks  # Trusts client-provided user_id

✅ CORRECT - Verify from JWT
user_id = verify_jwt(request.headers["Authorization"])
if request.params.user_id != user_id:
    raise Forbidden
return get_tasks_for_user(user_id)
```

**Rationale:** Client can be manipulated; only trust server-verified tokens

### Principle 3: Fail Secure

**Implementation:** When in doubt, deny access

```python
def get_task(task_id: int, user_id: str):
    task = db.query(Task).filter_by(id=task_id).first()

    if not task:
        # Could be: doesn't exist OR belongs to another user
        # Response: Same error for both cases
        raise TaskNotFoundError()  # Don't leak existence

    if task.user_id != user_id:
        # Same error as above
        raise TaskNotFoundError()  # Fail secure

    return task
```

**Rationale:** Don't leak information about existence of other users' data

### Principle 4: Principle of Least Privilege

**Implementation:** Users can ONLY access their own data

```sql
-- User A's query automatically filtered
SELECT * FROM tasks WHERE user_id = 'user-A';

-- User A CANNOT query all tasks
SELECT * FROM tasks;  -- ❌ Repository prevents this

-- User A CANNOT query User B's tasks
SELECT * FROM tasks WHERE user_id = 'user-B';  -- ❌ Authorization prevents this
```

**Rationale:** Users should have minimum necessary permissions

---

## Ownership Model

### Ownership Definition

**Owner:** The user who created the task

**Ownership Rules:**
1. Every task MUST have exactly one owner
2. Owner is set on task creation and CANNOT be changed
3. Ownership is determined by `user_id` foreign key
4. Only the owner can view, update, or delete their tasks

### Data Model

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,              -- Owner (REQUIRED)
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user                  -- Foreign key constraint
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE               -- Delete tasks if user deleted
);

-- Index for fast filtering by owner
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

### Ownership Lifecycle

```
1. Task Creation
   │
   ├─> User authenticates (JWT contains user_id)
   ├─> Backend extracts user_id from token
   ├─> Repository adds user_id to task record
   └─> Task is now owned by user ✓

2. Task Access
   │
   ├─> User requests task
   ├─> Backend verifies JWT
   ├─> Backend checks: task.user_id == jwt.user_id
   ├─> If match: grant access
   └─> If mismatch: deny with 403

3. Task Deletion
   │
   ├─> User deletes task
   ├─> Backend verifies ownership
   ├─> Repository deletes task
   └─> Ownership ends ✓

4. User Deletion
   │
   ├─> User account deleted
   ├─> Database CASCADE deletes all user's tasks
   └─> All ownership records removed ✓
```

---

## Enforcement Layers

### Layer 1: Database Level

**Mechanism:** Foreign key constraints and indexes

**Implementation:**
```sql
-- Foreign key ensures user_id references valid user
CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)

-- NOT NULL ensures every task has an owner
user_id TEXT NOT NULL

-- Index for efficient filtering
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**What This Prevents:**
- Tasks without owners (orphaned tasks)
- Tasks referencing non-existent users
- Invalid user_id values

**What This DOESN'T Prevent:**
- User A querying User B's tasks (need application layer)

### Layer 2: Repository Level

**Mechanism:** Automatic user_id filtering in all queries

**Implementation:**
```python
class PostgreSQLTaskRepository(TaskRepository):
    def __init__(self, db_session: Session, user_id: str):
        """
        Repository is scoped to a specific user.

        Args:
            db_session: Database session
            user_id: The user whose tasks this repository manages
        """
        self.db = db_session
        self.user_id = user_id  # User context stored

    def get_all(self) -> List[Task]:
        """
        Get all tasks for the authenticated user ONLY.
        """
        db_tasks = (
            self.db.query(TaskDB)
            .filter_by(user_id=self.user_id)  # ← Always filter by user
            .all()
        )
        return [self._to_domain(t) for t in db_tasks]

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """
        Get task by ID ONLY if it belongs to authenticated user.
        """
        db_task = (
            self.db.query(TaskDB)
            .filter_by(id=task_id, user_id=self.user_id)  # ← Both filters
            .first()
        )
        return self._to_domain(db_task) if db_task else None

    def add(self, task: Task) -> Task:
        """
        Add task with user_id automatically set.
        """
        db_task = TaskDB(
            title=task.title,
            description=task.description,
            completed=task.is_completed,
            user_id=self.user_id  # ← Automatically set from context
        )
        self.db.add(db_task)
        self.db.commit()
        return self._to_domain(db_task)

    def delete(self, task_id: int) -> None:
        """
        Delete task ONLY if it belongs to authenticated user.
        """
        result = (
            self.db.query(TaskDB)
            .filter_by(id=task_id, user_id=self.user_id)  # ← Ownership check
            .delete()
        )
        if result == 0:
            raise TaskNotFoundError(f"Task {task_id} not found")
        self.db.commit()
```

**What This Prevents:**
- Cross-user data access at the query level
- Accidental queries without user_id filter
- Repository misuse

**Key Pattern:** Repository is scoped to `user_id` at construction time

### Layer 3: Application Level (Use Cases)

**Mechanism:** Use Cases remain user-agnostic; repository handles filtering

**Phase I Use Cases (UNCHANGED):**
```python
class ListTasksUseCase:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def execute(self) -> List[Task]:
        """
        Returns all tasks.

        In Phase I: Returns all tasks from in-memory dict
        In Phase II: Repository is already scoped to user_id
        """
        return self.repository.get_all()
```

**Why This Works:**
- Use Case doesn't know about `user_id` (domain purity)
- Repository injected at runtime is already scoped to authenticated user
- No changes needed to Phase I use case code ✓

### Layer 4: API Level (Presentation)

**Mechanism:** JWT verification + URL parameter validation

**Implementation:**
```python
from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user

router = APIRouter()

@router.get("/api/{user_id}/tasks")
def get_tasks(
    user_id: str,  # From URL
    authenticated_user_id: str = Depends(get_current_user)  # From JWT
):
    """
    Get tasks for a user.

    Security:
        1. get_current_user dependency verifies JWT
        2. Extracts user_id from token
        3. We verify URL user_id matches token user_id
    """
    # CRITICAL: Verify URL parameter matches JWT claim
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Cannot access another user's tasks"
        )

    # Create user-scoped repository
    repository = PostgreSQLTaskRepository(db, authenticated_user_id)
    use_case = ListTasksUseCase(repository)

    tasks = use_case.execute()
    return [task_to_dict(t) for t in tasks]


@router.delete("/api/{user_id}/tasks/{task_id}")
def delete_task(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user)
):
    """
    Delete a task.

    Security:
        1. Verify JWT (via dependency)
        2. Verify URL user_id matches JWT user_id
        3. Repository will verify task ownership
    """
    if user_id != authenticated_user_id:
        raise HTTPException(403, "Forbidden")

    repository = PostgreSQLTaskRepository(db, authenticated_user_id)
    use_case = DeleteTaskUseCase(repository)

    try:
        use_case.execute(task_id)
        return {"message": "Task deleted"}
    except TaskNotFoundError:
        # Could be: doesn't exist OR belongs to another user
        # Same error for both (fail secure)
        raise HTTPException(404, "Task not found")
```

**What This Prevents:**
- URL parameter manipulation (user_id in URL doesn't match token)
- Unauthenticated requests (JWT required)
- Token forgery (signature verified)

### Layer 5: Frontend Level (UI)

**Mechanism:** Hide UI elements for unauthorized actions

**Implementation:**
```typescript
// Frontend should only show user's own tasks
// But this is NOT a security layer, just UX

function TaskList() {
  const { session } = useAuth();  // Get user session
  const userId = session.user.id;

  // Fetch only current user's tasks
  const { data: tasks } = useFetch(`/api/${userId}/tasks`, {
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  });

  return (
    <ul>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          userId={userId}  // Only current user's tasks
        />
      ))}
    </ul>
  );
}
```

**What This Prevents:**
- User confusion (won't see UI for other users' tasks)
- Accidental cross-user requests

**What This DOESN'T Prevent:**
- Malicious API calls (user can bypass frontend)
- This is UX, not security ⚠️

---

## Authorization Rules

### Rule 1: Task Creation

**Who Can Create:** Any authenticated user

**Owner Assignment:** Task owner = JWT user_id (automatic)

**Authorization Check:**
```python
# No explicit check needed - user_id comes from verified JWT
authenticated_user_id = get_current_user(jwt_token)  # Verified
repository = PostgreSQLTaskRepository(db, authenticated_user_id)
task = use_case.execute(title, description)  # Owned by authenticated_user_id
```

### Rule 2: Task Viewing (List)

**Who Can View:** Only the owner

**Authorization Check:**
```python
# Repository automatically filters by user_id
authenticated_user_id = get_current_user(jwt_token)
repository = PostgreSQLTaskRepository(db, authenticated_user_id)
tasks = repository.get_all()  # Only returns tasks where user_id = authenticated_user_id
```

### Rule 3: Task Viewing (Single)

**Who Can View:** Only the owner

**Authorization Check:**
```python
authenticated_user_id = get_current_user(jwt_token)
repository = PostgreSQLTaskRepository(db, authenticated_user_id)
task = repository.get_by_id(task_id)  # Returns None if task.user_id != authenticated_user_id

if not task:
    raise HTTPException(404, "Task not found")  # Fail secure
```

### Rule 4: Task Update

**Who Can Update:** Only the owner

**Authorization Check:**
```python
authenticated_user_id = get_current_user(jwt_token)
repository = PostgreSQLTaskRepository(db, authenticated_user_id)

# Repository verifies ownership in update method
try:
    task = use_case.execute(task_id, new_title, new_description)
except TaskNotFoundError:
    raise HTTPException(404, "Task not found")
```

### Rule 5: Task Deletion

**Who Can Delete:** Only the owner

**Authorization Check:**
```python
authenticated_user_id = get_current_user(jwt_token)
repository = PostgreSQLTaskRepository(db, authenticated_user_id)

# Repository verifies ownership before deleting
result = db.query(Task).filter_by(id=task_id, user_id=authenticated_user_id).delete()
if result == 0:
    raise HTTPException(404, "Task not found")
```

### Rule 6: Task Completion Toggle

**Who Can Toggle:** Only the owner

**Authorization Check:** Same as Rule 4 (Update)

---

## Attack Scenarios and Mitigations

### Attack 1: URL Parameter Manipulation

**Attack:**
```
User A (user-123) tries to access User B's tasks:
GET /api/user-456/tasks
Authorization: Bearer <User A's JWT>
```

**Mitigation:**
```python
@router.get("/api/{user_id}/tasks")
def get_tasks(user_id: str, auth_user: str = Depends(get_current_user)):
    if user_id != auth_user:  # user-456 != user-123
        raise HTTPException(403, "Forbidden")  # ✅ Blocked
```

**Result:** ✅ Attack prevented at API layer

### Attack 2: Direct Task ID Access

**Attack:**
```
User A knows User B has task_id=42
GET /api/user-123/tasks/42  # User A's user_id in URL
Authorization: Bearer <User A's JWT>
```

**Mitigation:**
```python
# Repository query
task = db.query(Task).filter_by(id=42, user_id='user-123').first()
# If task 42 belongs to user-456, this returns None
if not task:
    raise HTTPException(404)  # ✅ Blocked
```

**Result:** ✅ Attack prevented at repository layer

### Attack 3: JWT Forgery

**Attack:**
```
Attacker creates fake JWT:
{
  "sub": "user-456",  # Impersonate User B
  "exp": ...
}
```

**Mitigation:**
```python
try:
    payload = jwt.decode(token, SECRET, algorithms=["HS256"])
except jwt.InvalidTokenError:
    raise HTTPException(401, "Invalid token")  # ✅ Blocked
```

**Result:** ✅ Attack prevented (signature verification fails)

### Attack 4: SQL Injection

**Attack:**
```
POST /api/user-123/tasks
Body: {
  "title": "'; DROP TABLE tasks; --"
}
```

**Mitigation:**
```python
# SQLModel/SQLAlchemy uses parameterized queries
db_task = TaskDB(title=title)  # ✅ Escaped automatically
db.add(db_task)
db.commit()
```

**Result:** ✅ Attack prevented (input is escaped)

### Attack 5: IDOR (Insecure Direct Object Reference)

**Attack:**
```
User A deletes task by guessing IDs:
DELETE /api/user-123/tasks/1
DELETE /api/user-123/tasks/2
DELETE /api/user-123/tasks/3  # User B's task
```

**Mitigation:**
```python
# Repository checks ownership before delete
result = db.query(Task).filter_by(id=3, user_id='user-123').delete()
# Task 3 belongs to user-456, so filter returns 0 rows
if result == 0:
    raise TaskNotFoundError()  # ✅ Blocked
```

**Result:** ✅ Attack prevented at repository layer

### Attack 6: Information Leakage via Error Messages

**Attack:**
```
User A probes for existence of other tasks:
GET /api/user-123/tasks/999

Response: "Task 999 exists but belongs to another user"  # ❌ BAD
```

**Mitigation:**
```python
task = repository.get_by_id(999)
if not task:
    # Same error whether task doesn't exist or belongs to another user
    raise HTTPException(404, "Task not found")  # ✅ Fail secure
```

**Result:** ✅ Attack mitigated (no information leaked)

---

## Testing Strategy

### Unit Tests (Repository Layer)

```python
def test_repository_filters_by_user():
    # Create tasks for two users
    user_a_repo = PostgreSQLTaskRepository(db, "user-A")
    user_b_repo = PostgreSQLTaskRepository(db, "user-B")

    task_a = user_a_repo.add(Task(title="Task A"))
    task_b = user_b_repo.add(Task(title="Task B"))

    # User A should only see their task
    user_a_tasks = user_a_repo.get_all()
    assert len(user_a_tasks) == 1
    assert user_a_tasks[0].title == "Task A"

    # User B should only see their task
    user_b_tasks = user_b_repo.get_all()
    assert len(user_b_tasks) == 1
    assert user_b_tasks[0].title == "Task B"

def test_repository_get_by_id_respects_ownership():
    user_a_repo = PostgreSQLTaskRepository(db, "user-A")
    user_b_repo = PostgreSQLTaskRepository(db, "user-B")

    task_a = user_a_repo.add(Task(title="Task A"))

    # User A can get their task
    retrieved = user_a_repo.get_by_id(task_a.id)
    assert retrieved is not None

    # User B cannot get User A's task
    retrieved = user_b_repo.get_by_id(task_a.id)
    assert retrieved is None  # ✅ Ownership enforced
```

### Integration Tests (API Layer)

```python
def test_api_prevents_cross_user_access():
    # Register two users
    user_a = register_user("a@example.com", "pass123")
    user_b = register_user("b@example.com", "pass456")

    # User A creates a task
    response = client.post(
        f"/api/{user_a['id']}/tasks",
        headers={"Authorization": f"Bearer {user_a['token']}"},
        json={"title": "User A's task"}
    )
    task_id = response.json()["id"]

    # User B tries to access User A's task
    response = client.get(
        f"/api/{user_a['id']}/tasks/{task_id}",  # User A's URL
        headers={"Authorization": f"Bearer {user_b['token']}"}  # User B's token
    )
    assert response.status_code == 403  # ✅ Forbidden

def test_api_task_list_isolation():
    user_a = register_user("a@example.com", "pass123")
    user_b = register_user("b@example.com", "pass456")

    # User A creates 3 tasks
    for i in range(3):
        client.post(
            f"/api/{user_a['id']}/tasks",
            headers={"Authorization": f"Bearer {user_a['token']}"},
            json={"title": f"Task A{i}"}
        )

    # User B creates 2 tasks
    for i in range(2):
        client.post(
            f"/api/{user_b['id']}/tasks",
            headers={"Authorization": f"Bearer {user_b['token']}"},
            json={"title": f"Task B{i}"}
        )

    # User A should see only 3 tasks
    response = client.get(
        f"/api/{user_a['id']}/tasks",
        headers={"Authorization": f"Bearer {user_a['token']}"}
    )
    assert len(response.json()) == 3

    # User B should see only 2 tasks
    response = client.get(
        f"/api/{user_b['id']}/tasks",
        headers={"Authorization": f"Bearer {user_b['token']}"}
    )
    assert len(response.json()) == 2
```

### Security Tests (Penetration Testing)

```python
def test_jwt_forgery_prevention():
    # Create fake JWT without proper signature
    fake_token = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLTEyMyJ9."

    response = client.get(
        "/api/user-123/tasks",
        headers={"Authorization": f"Bearer {fake_token}"}
    )
    assert response.status_code == 401  # ✅ Invalid token

def test_sql_injection_prevention():
    user = register_user("test@example.com", "pass123")

    # Try SQL injection in title
    response = client.post(
        f"/api/{user['id']}/tasks",
        headers={"Authorization": f"Bearer {user['token']}"},
        json={"title": "'; DROP TABLE tasks; --"}
    )
    assert response.status_code == 201  # ✅ Task created (not executed as SQL)

    # Verify tasks table still exists
    response = client.get(
        f"/api/{user['id']}/tasks",
        headers={"Authorization": f"Bearer {user['token']}"}
    )
    assert response.status_code == 200  # ✅ Table not dropped
```

---

## Acceptance Criteria

### AC-OWN-1: User Cannot See Other Users' Tasks

**Given:** User A has 5 tasks and User B has 3 tasks
**When:** User A requests their task list
**Then:**
- User A sees exactly 5 tasks (their own)
- User A does NOT see any of User B's 3 tasks
- Total tasks returned: 5 (not 8)

### AC-OWN-2: User Cannot Access Other Users' Task Details

**Given:** User B has a task with ID 42
**When:** User A tries to GET /api/user-A/tasks/42
**Then:**
- Request returns 404 Not Found
- No task details are returned
- No information about task existence is leaked

### AC-OWN-3: User Cannot Modify Other Users' Tasks

**Given:** User B has a task with ID 42
**When:** User A tries to PUT /api/user-A/tasks/42 with new data
**Then:**
- Request returns 404 Not Found
- Task 42 is not modified
- User B's task remains unchanged

### AC-OWN-4: User Cannot Delete Other Users' Tasks

**Given:** User B has a task with ID 42
**When:** User A tries to DELETE /api/user-A/tasks/42
**Then:**
- Request returns 404 Not Found
- Task 42 is not deleted
- User B's task still exists

### AC-OWN-5: URL Manipulation is Prevented

**Given:** User A has valid JWT token for user-123
**When:** User A tries to GET /api/user-456/tasks (User B's endpoint)
**Then:**
- Request returns 403 Forbidden
- No tasks are returned
- Error message: "Cannot access another user's tasks"

### AC-OWN-6: Tasks Are Automatically Scoped to Owner

**Given:** User A is authenticated
**When:** User A creates a new task
**Then:**
- Task is automatically assigned user_id = User A's ID
- User A did not provide user_id in request
- Task appears in User A's task list
- Task does NOT appear in any other user's list

### AC-OWN-7: Database Enforces Ownership

**Given:** Database contains tasks for multiple users
**When:** Direct SQL query attempts: SELECT * FROM tasks
**Then:**
- Query returns all tasks (database level doesn't filter)
- BUT application NEVER executes such queries
- All queries include WHERE user_id = <authenticated_user>

---

## Appendix: Security Checklist

### Pre-Deployment Checklist

- [ ] JWT signature verification enabled
- [ ] BETTER_AUTH_SECRET is strong (32+ bytes)
- [ ] All API endpoints require authentication
- [ ] All API endpoints verify user_id parameter matches JWT
- [ ] Repository always filters by user_id
- [ ] Database has foreign key constraints
- [ ] Database has indexes on user_id columns
- [ ] Error messages don't leak information
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevention enabled (React auto-escaping)
- [ ] HTTPS enforced in production
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Audit logging enabled

### Security Audit Questions

**Q1:** Can a user access another user's task by manipulating the URL?
**A:** No → 403 Forbidden (API layer blocks)

**Q2:** Can a user access another user's task by guessing task IDs?
**A:** No → 404 Not Found (repository layer blocks)

**Q3:** Can a user forge a JWT to impersonate another user?
**A:** No → 401 Unauthorized (signature verification fails)

**Q4:** Can a user inject SQL to access other users' data?
**A:** No → Input is escaped (parameterized queries)

**Q5:** If JWT verification is bypassed, can user access other data?
**A:** No → Repository still filters by user_id (defense in depth)

**Q6:** If repository filtering is bypassed, does database prevent access?
**A:** No → Database doesn't filter, BUT repository is never bypassed (trust boundary)

---

**Document Status:** Complete
**Dependencies:** authentication.md, task-crud.md, overview.md
**Related Specs:** api/rest-endpoints.md, database/schema.md
**Implementation:** Not started (spec-only phase)

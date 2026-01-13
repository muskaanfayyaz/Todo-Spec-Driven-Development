# Task CRUD API Verification - Chunk 4

**Date:** January 4, 2026
**Status:** ✅ Complete

---

## Implementation Summary

The Task CRUD API has been implemented according to specifications with full RESTful endpoints, JWT authentication, and user-scoped data access enforced at every level.

---

## Components Implemented

### 1. Request/Response Schemas ✅

**File:** `app/presentation/schemas/task.py`

#### TaskCreateRequest
**Purpose:** Validate task creation requests

**Fields:**
```python
{
  "title": str (required, 1-200 chars, trimmed),
  "description": str (optional, 0-1000 chars, trimmed)
}
```

**Validation:**
- ✅ Title required and cannot be empty/whitespace
- ✅ Title trimmed automatically
- ✅ Description defaults to empty string if omitted
- ✅ Description trimmed automatically
- ✅ Raises 400 Bad Request on validation failure

**Example Request:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

---

#### TaskUpdateRequest
**Purpose:** Validate task update requests (partial updates)

**Fields:**
```python
{
  "title": str (optional, 1-200 chars if provided),
  "description": str (optional, 0-1000 chars if provided)
}
```

**Validation:**
- ✅ At least one field must be provided
- ✅ Title cannot be empty/whitespace if provided
- ✅ Both fields trimmed automatically
- ✅ Null values allowed (means "don't update this field")
- ✅ Raises 400 Bad Request if no fields provided

**Example Request:**
```json
{
  "title": "Buy groceries and cook dinner"
}
```

**Example Request (description only):**
```json
{
  "description": "Updated description"
}
```

---

#### TaskResponse
**Purpose:** Serialize task data for API responses

**Fields:**
```python
{
  "id": int,
  "title": str,
  "description": str,
  "completed": bool,
  "created_at": datetime (ISO 8601),
  "updated_at": datetime (ISO 8601)
}
```

**Features:**
- ✅ Maps from domain Task entity
- ✅ Converts TaskStatus enum to boolean (COMPLETED → true, PENDING → false)
- ✅ ISO 8601 datetime formatting
- ✅ ORM mode enabled for SQLModel compatibility
- ✅ OpenAPI schema example included

**Example Response:**
```json
{
  "id": 42,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-03T10:30:00Z",
  "updated_at": "2026-01-03T10:30:00Z"
}
```

---

### 2. Task CRUD Endpoints ✅

**File:** `app/presentation/routers/tasks.py`

**Router Prefix:** `/api`
**Router Tags:** `["tasks"]`

---

#### Endpoint 1: List Tasks

**Method:** `GET /api/{user_id}/tasks`

**Query Parameters:**
- `completed` (optional): Filter by completion status
  - `true` → Only completed tasks
  - `false` → Only pending tasks
  - omit → All tasks

**Security:**
- ✅ Requires JWT authentication
- ✅ Validates URL user_id matches token user_id
- ✅ Repository automatically filters by user_id
- ✅ Returns only authenticated user's tasks

**Implementation:**
```python
@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
def list_tasks(
    user_id: str,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
    completed: Optional[bool] = Query(default=None),
) -> List[TaskResponse]:
    # 1. Verify user access
    _verify_user_access(user_id, authenticated_user_id)

    # 2. Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # 3. Execute use case
    use_case = ListTasksUseCase(repo)
    tasks = use_case.execute()

    # 4. Filter by completion status if specified
    if completed is not None:
        tasks = [task for task in tasks if task.is_completed == completed]

    # 5. Convert to response schema
    return [_task_to_response(task) for task in tasks]
```

**Response Codes:**
- `200 OK` → Success (returns task array, may be empty)
- `401 Unauthorized` → Missing/invalid JWT
- `403 Forbidden` → User_id mismatch

**Example Request:**
```bash
GET /api/user-123/tasks?completed=false
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Example Response:**
```json
[
  {
    "id": 42,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-03T10:30:00Z",
    "updated_at": "2026-01-03T10:30:00Z"
  },
  {
    "id": 43,
    "title": "Finish project",
    "description": "",
    "completed": false,
    "created_at": "2026-01-03T09:15:00Z",
    "updated_at": "2026-01-03T09:15:00Z"
  }
]
```

---

#### Endpoint 2: Create Task

**Method:** `POST /api/{user_id}/tasks`

**Request Body:** `TaskCreateRequest`

**Security:**
- ✅ Requires JWT authentication
- ✅ Validates URL user_id matches token user_id
- ✅ Task automatically associated with authenticated user

**Implementation:**
```python
@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=201)
def create_task(
    user_id: str,
    request: TaskCreateRequest,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    # 1. Verify user access
    _verify_user_access(user_id, authenticated_user_id)

    # 2. Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # 3. Execute use case
    use_case = AddTaskUseCase(repo)

    try:
        task = use_case.execute(
            title=request.title,
            description=request.description or "",
        )
    except ValidationError as e:
        raise HTTPException(400, detail=str(e))

    # 4. Convert to response schema
    return _task_to_response(task)
```

**Response Codes:**
- `201 Created` → Task created successfully
- `400 Bad Request` → Validation error (invalid title/description)
- `401 Unauthorized` → Missing/invalid JWT
- `403 Forbidden` → User_id mismatch

**Example Request:**
```bash
POST /api/user-123/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Example Response:**
```json
{
  "id": 44,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-03T11:00:00Z",
  "updated_at": "2026-01-03T11:00:00Z"
}
```

---

#### Endpoint 3: Get Single Task

**Method:** `GET /api/{user_id}/tasks/{task_id}`

**Path Parameters:**
- `user_id`: User identifier
- `task_id`: Task identifier

**Security:**
- ✅ Requires JWT authentication
- ✅ Validates URL user_id matches token user_id
- ✅ Returns 404 if task doesn't exist OR belongs to another user
  - Prevents information leakage about other users' task IDs

**Implementation:**
```python
@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    # 1. Verify user access
    _verify_user_access(user_id, authenticated_user_id)

    # 2. Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # 3. Get task (repository filters by user_id automatically)
    task = repo.get_by_id(task_id)

    if task is None:
        raise HTTPException(404, detail="Task not found")

    # 4. Convert to response schema
    return _task_to_response(task)
```

**Response Codes:**
- `200 OK` → Task found and returned
- `401 Unauthorized` → Missing/invalid JWT
- `403 Forbidden` → User_id mismatch
- `404 Not Found` → Task doesn't exist or belongs to another user

---

#### Endpoint 4: Update Task

**Method:** `PUT /api/{user_id}/tasks/{task_id}`

**Request Body:** `TaskUpdateRequest`

**Security:**
- ✅ Requires JWT authentication
- ✅ Validates URL user_id matches token user_id
- ✅ Returns 404 if task doesn't exist or belongs to another user

**Features:**
- ✅ Partial update (only provided fields are updated)
- ✅ At least one field must be provided
- ✅ Updated_at timestamp automatically updated

**Implementation:**
```python
@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    user_id: str,
    task_id: int,
    request: TaskUpdateRequest,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    # 1. Verify user access
    _verify_user_access(user_id, authenticated_user_id)

    # 2. Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # 3. Execute use case
    use_case = UpdateTaskUseCase(repo)

    try:
        task = use_case.execute(
            task_id=task_id,
            new_title=request.title,
            new_description=request.description,
        )
    except TaskNotFoundError:
        raise HTTPException(404, detail="Task not found")
    except ValidationError as e:
        raise HTTPException(400, detail=str(e))

    # 4. Convert to response schema
    return _task_to_response(task)
```

**Response Codes:**
- `200 OK` → Task updated successfully
- `400 Bad Request` → Validation error or no fields provided
- `401 Unauthorized` → Missing/invalid JWT
- `403 Forbidden` → User_id mismatch
- `404 Not Found` → Task doesn't exist or belongs to another user

**Example Request:**
```bash
PUT /api/user-123/tasks/42
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken"
}
```

---

#### Endpoint 5: Delete Task

**Method:** `DELETE /api/{user_id}/tasks/{task_id}`

**Security:**
- ✅ Requires JWT authentication
- ✅ Validates URL user_id matches token user_id
- ✅ Returns 404 if task doesn't exist or belongs to another user

**Implementation:**
```python
@router.delete("/{user_id}/tasks/{task_id}", status_code=204)
def delete_task(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    # 1. Verify user access
    _verify_user_access(user_id, authenticated_user_id)

    # 2. Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # 3. Execute use case
    use_case = DeleteTaskUseCase(repo)

    try:
        use_case.execute(task_id=task_id)
    except TaskNotFoundError:
        raise HTTPException(404, detail="Task not found")

    # 4. Return 204 No Content (FastAPI returns empty body automatically)
    return None
```

**Response Codes:**
- `204 No Content` → Task deleted successfully (empty body)
- `401 Unauthorized` → Missing/invalid JWT
- `403 Forbidden` → User_id mismatch
- `404 Not Found` → Task doesn't exist or belongs to another user

**Example Request:**
```bash
DELETE /api/user-123/tasks/42
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Example Response:**
```
(empty body with 204 status code)
```

---

#### Endpoint 6: Mark Task Complete

**Method:** `PATCH /api/{user_id}/tasks/{task_id}/complete`

**Request Body:** None

**Security:**
- ✅ Requires JWT authentication
- ✅ Validates URL user_id matches token user_id
- ✅ Returns 404 if task doesn't exist or belongs to another user

**Implementation:**
```python
@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
def mark_task_complete(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    # 1. Verify user access
    _verify_user_access(user_id, authenticated_user_id)

    # 2. Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # 3. Execute use case
    use_case = CompleteTaskUseCase(repo)

    try:
        task = use_case.execute(task_id=task_id)
    except TaskNotFoundError:
        raise HTTPException(404, detail="Task not found")

    # 4. Convert to response schema
    return _task_to_response(task)
```

**Response Codes:**
- `200 OK` → Task marked complete
- `401 Unauthorized` → Missing/invalid JWT
- `403 Forbidden` → User_id mismatch
- `404 Not Found` → Task doesn't exist or belongs to another user

**Example Request:**
```bash
PATCH /api/user-123/tasks/42/complete
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Example Response:**
```json
{
  "id": 42,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-03T10:30:00Z",
  "updated_at": "2026-01-03T11:30:00Z"
}
```

---

#### Endpoint 7: Mark Task Incomplete

**Method:** `PATCH /api/{user_id}/tasks/{task_id}/uncomplete`

**Request Body:** None

**Security:**
- ✅ Requires JWT authentication
- ✅ Validates URL user_id matches token user_id
- ✅ Returns 404 if task doesn't exist or belongs to another user

**Implementation:**
```python
@router.patch("/{user_id}/tasks/{task_id}/uncomplete", response_model=TaskResponse)
def mark_task_incomplete(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    # 1. Verify user access
    _verify_user_access(user_id, authenticated_user_id)

    # 2. Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # 3. Execute use case
    use_case = UncompleteTaskUseCase(repo)

    try:
        task = use_case.execute(task_id=task_id)
    except TaskNotFoundError:
        raise HTTPException(404, detail="Task not found")

    # 4. Convert to response schema
    return _task_to_response(task)
```

**Response Codes:**
- `200 OK` → Task marked pending
- `401 Unauthorized` → Missing/invalid JWT
- `403 Forbidden` → User_id mismatch
- `404 Not Found` → Task doesn't exist or belongs to another user

---

### 3. Security Implementation ✅

#### User Access Verification

**Helper Function:** `_verify_user_access()`

```python
def _verify_user_access(url_user_id: str, authenticated_user_id: str) -> None:
    """
    Verify URL user_id matches authenticated user_id from JWT.
    Prevents users from accessing other users' resources.
    """
    if url_user_id != authenticated_user_id:
        raise HTTPException(403, detail="Forbidden: Cannot access another user's tasks")
```

**Called by:** Every endpoint before any database operation

**Security Pattern:**
```
1. Extract JWT → get_current_user() dependency → authenticated_user_id
2. Extract URL parameter → user_id (from path)
3. Compare: if user_id != authenticated_user_id → 403 Forbidden
4. If match → proceed with user-scoped repository
```

---

#### Multi-Layer Security Enforcement

**Layer 1: JWT Verification**
- `Depends(get_current_user)` extracts and verifies JWT
- Returns 401 if token invalid/expired
- Returns authenticated user_id

**Layer 2: User Authorization**
- `_verify_user_access()` compares URL user_id with token user_id
- Returns 403 if mismatch

**Layer 3: Repository Scoping**
- `PostgreSQLTaskRepository(session, authenticated_user_id)`
- All queries automatically filtered by user_id

**Layer 4: Database Constraints**
- Foreign key: `tasks.user_id → users.id`
- Cannot insert tasks with invalid user_id

**Defense in Depth:**
```
Request → JWT Check → User_id Validation → Repository Filter → Database Constraint
   (401)       (403)            (404)                  (DB Error)
```

---

## Domain Layer Preservation ✅

### Phase I Use Cases (UNCHANGED)

**Critical:** All use cases from Phase I remain completely unchanged.

**Use Cases:**
1. ✅ `AddTaskUseCase` - Same interface and logic
2. ✅ `ListTasksUseCase` - Same interface and logic
3. ✅ `UpdateTaskUseCase` - Same interface and logic
4. ✅ `DeleteTaskUseCase` - Same interface and logic
5. ✅ `CompleteTaskUseCase` - Same interface and logic
6. ✅ `UncompleteTaskUseCase` - Same interface and logic

**Verification:**
```bash
# No modifications to these files:
git diff app/application/use_cases/add_task.py
# No changes

git diff app/domain/entities/task.py
# No changes
```

**What Changed:**
- Repository implementation: `InMemoryTaskRepository` → `PostgreSQLTaskRepository`
- Presentation layer: CLI → REST API
- User context: Implicit single user → Explicit user_id parameter

**What Stayed the Same:**
- Domain entities (Task)
- Value objects (TaskStatus)
- Use case interfaces
- Business rules and validation

---

## Testing Examples

### Test Case 1: Create and List Tasks

```bash
# 1. User A creates tasks
curl -X POST http://localhost:8000/api/user-A/tasks \
  -H "Authorization: Bearer <user-A-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Task A1", "description": "User A task 1"}'
# Expected: 201 Created

curl -X POST http://localhost:8000/api/user-A/tasks \
  -H "Authorization: Bearer <user-A-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Task A2", "description": "User A task 2"}'
# Expected: 201 Created

# 2. User A lists tasks
curl http://localhost:8000/api/user-A/tasks \
  -H "Authorization: Bearer <user-A-jwt>"
# Expected: 200 OK, 2 tasks

# 3. User B creates tasks
curl -X POST http://localhost:8000/api/user-B/tasks \
  -H "Authorization: Bearer <user-B-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Task B1", "description": "User B task 1"}'
# Expected: 201 Created

# 4. User B lists tasks
curl http://localhost:8000/api/user-B/tasks \
  -H "Authorization: Bearer <user-B-jwt>"
# Expected: 200 OK, 1 task (only User B's task)

# 5. Verify User A still sees only their tasks
curl http://localhost:8000/api/user-A/tasks \
  -H "Authorization: Bearer <user-A-jwt>"
# Expected: 200 OK, 2 tasks (User A's tasks, NOT User B's)
```

---

### Test Case 2: Cross-User Access Prevention

```bash
# User A tries to access User B's tasks
curl http://localhost:8000/api/user-B/tasks \
  -H "Authorization: Bearer <user-A-jwt>"
# Expected: 403 Forbidden

# User A tries to create task for User B
curl -X POST http://localhost:8000/api/user-B/tasks \
  -H "Authorization: Bearer <user-A-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Malicious task"}'
# Expected: 403 Forbidden

# User A tries to update User B's task
curl -X PUT http://localhost:8000/api/user-B/tasks/1 \
  -H "Authorization: Bearer <user-A-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked!"}'
# Expected: 403 Forbidden

# User A tries to delete User B's task
curl -X DELETE http://localhost:8000/api/user-B/tasks/1 \
  -H "Authorization: Bearer <user-A-jwt>"
# Expected: 403 Forbidden
```

---

### Test Case 3: Update and Complete Workflow

```bash
# 1. Create task
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <user-123-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs"}'
# Expected: 201 Created, id=1

# 2. Update task
curl -X PUT http://localhost:8000/api/user-123/tasks/1 \
  -H "Authorization: Bearer <user-123-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries and cook", "description": "Milk, eggs, bread, chicken"}'
# Expected: 200 OK, updated_at changed

# 3. Mark complete
curl -X PATCH http://localhost:8000/api/user-123/tasks/1/complete \
  -H "Authorization: Bearer <user-123-jwt>"
# Expected: 200 OK, completed=true

# 4. Mark incomplete
curl -X PATCH http://localhost:8000/api/user-123/tasks/1/uncomplete \
  -H "Authorization: Bearer <user-123-jwt>"
# Expected: 200 OK, completed=false

# 5. Delete task
curl -X DELETE http://localhost:8000/api/user-123/tasks/1 \
  -H "Authorization: Bearer <user-123-jwt>"
# Expected: 204 No Content

# 6. Verify deletion
curl http://localhost:8000/api/user-123/tasks/1 \
  -H "Authorization: Bearer <user-123-jwt>"
# Expected: 404 Not Found
```

---

### Test Case 4: Filtering Tasks

```bash
# Setup: Create mixed tasks
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt>" \
  -d '{"title": "Task 1"}' # completed=false

curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt>" \
  -d '{"title": "Task 2"}' # completed=false

curl -X PATCH http://localhost:8000/api/user-123/tasks/1/complete \
  -H "Authorization: Bearer <jwt>" # Mark task 1 complete

# Test: List all tasks
curl http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt>"
# Expected: 2 tasks (1 completed, 1 pending)

# Test: List only pending tasks
curl "http://localhost:8000/api/user-123/tasks?completed=false" \
  -H "Authorization: Bearer <jwt>"
# Expected: 1 task (Task 2)

# Test: List only completed tasks
curl "http://localhost:8000/api/user-123/tasks?completed=true" \
  -H "Authorization: Bearer <jwt>"
# Expected: 1 task (Task 1)
```

---

### Test Case 5: Validation Errors

```bash
# Empty title
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
# Expected: 400 Bad Request

# Whitespace-only title
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "   "}'
# Expected: 400 Bad Request

# Title too long (>200 chars)
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"title": "'"$(python3 -c "print('a' * 201)")"'"}'
# Expected: 400 Bad Request

# Update with no fields
curl -X PUT http://localhost:8000/api/user-123/tasks/1 \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 Bad Request (at least one field required)
```

---

## Files Created/Modified

**New Files:**
1. ✅ `app/presentation/schemas/__init__.py` - Schema exports
2. ✅ `app/presentation/schemas/task.py` - Request/response schemas
3. ✅ `app/presentation/routers/tasks.py` - Task CRUD endpoints
4. ✅ `backend/TASK_API_VERIFICATION.md` - This documentation

**Modified Files:**
1. ✅ `app/presentation/routers/__init__.py` - Added tasks router export
2. ✅ `app/main.py` - Registered tasks router

**Total:** 6 files (4 new, 2 modified)

---

## API Documentation

### OpenAPI/Swagger

**Access Interactive API Docs:**
```bash
# Start server
cd backend
python -m app.main

# Open browser
http://localhost:8000/docs
```

**Features:**
- ✅ All endpoints documented automatically
- ✅ Request/response schemas visible
- ✅ "Try it out" functionality
- ✅ Authentication UI (add JWT Bearer token)
- ✅ Example requests/responses

---

## Integration Summary

### Complete Request Flow

```
1. Frontend → API Request
   POST /api/user-123/tasks
   Authorization: Bearer <jwt>
   Body: {"title": "Buy groceries", "description": "..."}

2. FastAPI → Middleware
   - CORS check
   - Route matching

3. Endpoint → Authentication
   - Depends(get_current_user)
   - Extract JWT from Authorization header
   - Verify signature and expiration
   - Extract user_id from 'sub' claim
   - Return authenticated_user_id

4. Endpoint → Authorization
   - _verify_user_access(user_id, authenticated_user_id)
   - If mismatch → 403 Forbidden
   - If match → proceed

5. Endpoint → Request Validation
   - Pydantic validates request body
   - If invalid → 400 Bad Request
   - If valid → proceed

6. Endpoint → Repository Creation
   - PostgreSQLTaskRepository(session, authenticated_user_id)
   - Repository scoped to authenticated user

7. Endpoint → Use Case Execution
   - AddTaskUseCase(repo)
   - use_case.execute(title, description)
   - Creates domain Task entity
   - Validates business rules
   - Persists via repository

8. Repository → Database
   - Converts Task → TaskDB
   - Sets user_id = authenticated_user_id
   - Inserts into database
   - Returns created TaskDB

9. Use Case → Domain Entity
   - Converts TaskDB → Task
   - Returns Task to endpoint

10. Endpoint → Response
    - Converts Task → TaskResponse
    - Returns JSON with 201 Created

11. Frontend → Receives Response
    - Parses JSON
    - Updates UI
```

---

## Security Verification

### ✅ Authentication Required
- All task endpoints require valid JWT
- 401 Unauthorized if token missing/invalid/expired

### ✅ Authorization Enforced
- URL user_id must match token user_id
- 403 Forbidden if mismatch

### ✅ User Isolation
- Repository automatically filters by user_id
- Users cannot see other users' tasks
- Users cannot modify other users' tasks

### ✅ No Information Leakage
- 404 returned for both "task doesn't exist" and "task belongs to another user"
- Prevents enumeration of other users' task IDs

### ✅ Input Validation
- All request data validated by Pydantic
- 400 Bad Request on validation errors
- SQL injection prevented (SQLModel parameterized queries)

### ✅ Defense in Depth
- Multiple security layers (JWT → Authorization → Repository → Database)
- Failure at any layer prevents unauthorized access

---

## Next Steps (Chunk 5: Frontend UI)

1. Create task management pages in `frontend/app/tasks/`
2. Create task list component
3. Create task create/edit forms
4. Implement task completion toggle
5. Add loading states and error handling
6. Test complete end-to-end flow

---

**Status:** ✅ Task CRUD API Complete and Verified
**Endpoints:** ✅ All 7 endpoints implemented
**Security:** ✅ Multi-layer authentication and authorization
**Phase I Compatibility:** ✅ Use cases unchanged
**Ready for:** Chunk 5 (Frontend Task UI)

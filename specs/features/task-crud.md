# Feature Specification: Task CRUD Operations

**Version:** 1.0
**Date:** January 3, 2026
**Feature:** Task Create, Read, Update, Delete, Complete/Uncomplete
**Status:** Specification

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [User Stories](#user-stories)
3. [Functional Requirements](#functional-requirements)
4. [Use Cases](#use-cases)
5. [Business Rules](#business-rules)
6. [Validation Rules](#validation-rules)
7. [Error Handling](#error-handling)
8. [Acceptance Criteria](#acceptance-criteria)

---

## Feature Overview

### Purpose

Enable authenticated users to manage their personal task lists through five core operations:
1. **Create** - Add new tasks
2. **Read** - View tasks (list and detail)
3. **Update** - Modify existing tasks
4. **Delete** - Remove tasks
5. **Complete/Uncomplete** - Toggle task completion status

### Scope

**In Scope:**
- All operations require authentication
- All operations are user-scoped (users see only their own tasks)
- All operations persist to database
- All operations trigger UI updates

**Out of Scope:**
- Task sharing between users
- Task assignment
- Task categories or tags
- Task priorities
- Task due dates
- Recurring tasks

### Phase I Compatibility

Phase I use cases MUST remain unchanged:
- `AddTaskUseCase` - Same interface and logic
- `ListTasksUseCase` - Same interface and logic
- `UpdateTaskUseCase` - Same interface and logic
- `DeleteTaskUseCase` - Same interface and logic
- `CompleteTaskUseCase` - Same interface and logic
- `UncompleteTaskUseCase` - Same interface and logic

**What Changes:**
- Repository implementation (InMemory → PostgreSQL)
- Presentation layer (CLI → REST API + Web UI)
- User context (implicit single user → explicit user_id)

---

## User Stories

### US-1: Create Task

**As a** logged-in user
**I want to** create a new task with a title and optional description
**So that** I can track something I need to do

**Acceptance Criteria:**
- User is authenticated (has valid JWT)
- User provides a task title (required, 1-200 characters)
- User can optionally provide a description (0-1000 characters)
- Task is created with status "pending"
- Task is associated with the authenticated user
- Task is immediately visible in the user's task list
- System assigns a unique ID and timestamps

### US-2: View Task List

**As a** logged-in user
**I want to** see a list of all my tasks
**So that** I can review what I need to do

**Acceptance Criteria:**
- User is authenticated (has valid JWT)
- System displays only tasks belonging to the authenticated user
- Tasks are displayed with ID, title, description (truncated), and status
- Empty list message shown if user has no tasks
- Tasks are sorted by creation date (newest first)

### US-3: View Task Details

**As a** logged-in user
**I want to** view full details of a specific task
**So that** I can see the complete information

**Acceptance Criteria:**
- User is authenticated (has valid JWT)
- User can request details for a task they own
- System displays full title, full description, status, and timestamps
- System returns 404 if task doesn't exist
- System returns 403 if task belongs to another user

### US-4: Update Task

**As a** logged-in user
**I want to** modify the title or description of my task
**So that** I can correct or clarify the task

**Acceptance Criteria:**
- User is authenticated (has valid JWT)
- User can update title (1-200 characters)
- User can update description (0-1000 characters)
- System validates new values before saving
- System updates `updated_at` timestamp
- System returns 404 if task doesn't exist
- System returns 403 if task belongs to another user

### US-5: Delete Task

**As a** logged-in user
**I want to** delete a task I no longer need
**So that** I can keep my task list clean

**Acceptance Criteria:**
- User is authenticated (has valid JWT)
- User can delete a task they own
- Task is permanently removed from database
- Task no longer appears in user's task list
- System returns 404 if task doesn't exist
- System returns 403 if task belongs to another user

### US-6: Mark Task as Complete

**As a** logged-in user
**I want to** mark a task as completed
**So that** I can track my progress

**Acceptance Criteria:**
- User is authenticated (has valid JWT)
- User can mark a pending task as complete
- Task status changes from "pending" to "completed"
- System updates `updated_at` timestamp
- UI reflects the status change (e.g., strikethrough, checkmark)
- System returns 404 if task doesn't exist
- System returns 403 if task belongs to another user

### US-7: Mark Task as Incomplete

**As a** logged-in user
**I want to** mark a completed task as pending
**So that** I can reopen tasks if needed

**Acceptance Criteria:**
- User is authenticated (has valid JWT)
- User can mark a completed task as pending
- Task status changes from "completed" to "pending"
- System updates `updated_at` timestamp
- UI reflects the status change
- System returns 404 if task doesn't exist
- System returns 403 if task belongs to another user

---

## Functional Requirements

### FR-1: Task Creation

**Requirement:** System SHALL allow authenticated users to create tasks

**Inputs:**
- `user_id`: string (from JWT, implicit)
- `title`: string (1-200 chars, required)
- `description`: string (0-1000 chars, optional)

**Process:**
1. Extract `user_id` from authenticated JWT token
2. Validate `title` length (1-200 characters)
3. Validate `description` length (0-1000 characters)
4. Create Task entity using `AddTaskUseCase`
5. Repository adds `user_id` context when persisting
6. Assign unique `id`, set `completed=false`, set timestamps
7. Save to database with foreign key to user

**Outputs:**
- Success: 201 Created with task JSON
- Validation Error: 400 Bad Request with error details
- Unauthorized: 401 Unauthorized

### FR-2: Task Retrieval (List)

**Requirement:** System SHALL allow authenticated users to retrieve their task list

**Inputs:**
- `user_id`: string (from JWT, implicit)
- `filter`: optional (e.g., completed=true/false)
- `sort`: optional (e.g., created_at, title)

**Process:**
1. Extract `user_id` from authenticated JWT token
2. Call `ListTasksUseCase`
3. Repository filters tasks by `user_id`
4. Apply optional filters and sorting
5. Return list of tasks

**Outputs:**
- Success: 200 OK with array of task JSON objects
- Unauthorized: 401 Unauthorized

### FR-3: Task Retrieval (Single)

**Requirement:** System SHALL allow authenticated users to retrieve a specific task

**Inputs:**
- `user_id`: string (from JWT, implicit)
- `task_id`: integer (from URL parameter)

**Process:**
1. Extract `user_id` from authenticated JWT token
2. Query repository for task with `id=task_id` AND `user_id=user_id`
3. Return task if found and belongs to user

**Outputs:**
- Success: 200 OK with task JSON
- Not Found: 404 Not Found
- Forbidden: 403 Forbidden (task exists but belongs to another user)
- Unauthorized: 401 Unauthorized

### FR-4: Task Update

**Requirement:** System SHALL allow authenticated users to update their tasks

**Inputs:**
- `user_id`: string (from JWT, implicit)
- `task_id`: integer (from URL parameter)
- `title`: string (1-200 chars, optional)
- `description`: string (0-1000 chars, optional)

**Process:**
1. Extract `user_id` from authenticated JWT token
2. Verify task exists and belongs to user
3. Validate new values if provided
4. Call `UpdateTaskUseCase` with new values
5. Update `updated_at` timestamp
6. Save changes to database

**Outputs:**
- Success: 200 OK with updated task JSON
- Validation Error: 400 Bad Request
- Not Found: 404 Not Found
- Forbidden: 403 Forbidden
- Unauthorized: 401 Unauthorized

### FR-5: Task Deletion

**Requirement:** System SHALL allow authenticated users to delete their tasks

**Inputs:**
- `user_id`: string (from JWT, implicit)
- `task_id`: integer (from URL parameter)

**Process:**
1. Extract `user_id` from authenticated JWT token
2. Verify task exists and belongs to user
3. Call `DeleteTaskUseCase`
4. Remove task from database

**Outputs:**
- Success: 204 No Content
- Not Found: 404 Not Found
- Forbidden: 403 Forbidden
- Unauthorized: 401 Unauthorized

### FR-6: Task Completion Toggle

**Requirement:** System SHALL allow authenticated users to toggle task completion status

**Inputs:**
- `user_id`: string (from JWT, implicit)
- `task_id`: integer (from URL parameter)
- `action`: "complete" or "uncomplete"

**Process:**
1. Extract `user_id` from authenticated JWT token
2. Verify task exists and belongs to user
3. Call `CompleteTaskUseCase` or `UncompleteTaskUseCase`
4. Update `completed` field
5. Update `updated_at` timestamp
6. Save changes to database

**Outputs:**
- Success: 200 OK with updated task JSON
- Not Found: 404 Not Found
- Forbidden: 403 Forbidden
- Unauthorized: 401 Unauthorized

---

## Use Cases

### Use Case 1: Add Task

**Actor:** Authenticated User

**Preconditions:**
- User is authenticated (valid JWT token)
- User has active session

**Main Flow:**
1. User fills out task creation form (title, description)
2. Frontend sends POST request to `/api/{user_id}/tasks` with JWT
3. Backend verifies JWT and extracts user_id
4. Backend validates input (title 1-200 chars, description 0-1000 chars)
5. Backend calls `AddTaskUseCase.execute(title, description)`
6. Use Case creates Task entity
7. Repository persists task with user_id
8. Backend returns 201 Created with task JSON
9. Frontend updates UI to show new task

**Postconditions:**
- New task exists in database with user_id
- User sees new task in their list

**Alternative Flows:**
- 4a. Validation fails → Return 400 Bad Request with error message
- 3a. JWT invalid → Return 401 Unauthorized

### Use Case 2: List Tasks

**Actor:** Authenticated User

**Preconditions:**
- User is authenticated (valid JWT token)

**Main Flow:**
1. User navigates to task list page
2. Frontend sends GET request to `/api/{user_id}/tasks` with JWT
3. Backend verifies JWT and extracts user_id
4. Backend calls `ListTasksUseCase.execute()`
5. Repository queries `SELECT * FROM tasks WHERE user_id = ?`
6. Use Case returns list of Task entities
7. Backend converts to JSON array
8. Frontend renders task list

**Postconditions:**
- User sees all their tasks (and only their tasks)

**Alternative Flows:**
- 3a. JWT invalid → Return 401 Unauthorized
- 5a. No tasks found → Return empty array

### Use Case 3: Update Task

**Actor:** Authenticated User

**Preconditions:**
- User is authenticated (valid JWT token)
- Task exists and belongs to user

**Main Flow:**
1. User edits task (changes title or description)
2. Frontend sends PUT request to `/api/{user_id}/tasks/{task_id}` with JWT
3. Backend verifies JWT and extracts user_id
4. Backend verifies task exists and user_id matches
5. Backend validates new values
6. Backend calls `UpdateTaskUseCase.execute(task_id, title, description)`
7. Repository updates task and sets updated_at
8. Backend returns 200 OK with updated task JSON
9. Frontend updates UI

**Postconditions:**
- Task is updated in database
- User sees updated task in UI

**Alternative Flows:**
- 4a. Task not found → Return 404 Not Found
- 4b. Task belongs to another user → Return 403 Forbidden
- 5a. Validation fails → Return 400 Bad Request

### Use Case 4: Delete Task

**Actor:** Authenticated User

**Preconditions:**
- User is authenticated (valid JWT token)
- Task exists and belongs to user

**Main Flow:**
1. User clicks delete button on a task
2. Frontend sends DELETE request to `/api/{user_id}/tasks/{task_id}` with JWT
3. Backend verifies JWT and extracts user_id
4. Backend verifies task exists and user_id matches
5. Backend calls `DeleteTaskUseCase.execute(task_id)`
6. Repository deletes task from database
7. Backend returns 204 No Content
8. Frontend removes task from UI

**Postconditions:**
- Task is deleted from database
- Task no longer appears in user's list

**Alternative Flows:**
- 4a. Task not found → Return 404 Not Found
- 4b. Task belongs to another user → Return 403 Forbidden

### Use Case 5: Complete Task

**Actor:** Authenticated User

**Preconditions:**
- User is authenticated (valid JWT token)
- Task exists, belongs to user, and is pending

**Main Flow:**
1. User clicks checkbox or "Mark Complete" button
2. Frontend sends PATCH request to `/api/{user_id}/tasks/{task_id}/complete` with JWT
3. Backend verifies JWT and extracts user_id
4. Backend verifies task exists and user_id matches
5. Backend calls `CompleteTaskUseCase.execute(task_id)`
6. Repository updates `completed=true` and `updated_at`
7. Backend returns 200 OK with updated task JSON
8. Frontend updates UI (e.g., adds strikethrough)

**Postconditions:**
- Task is marked as completed in database
- UI reflects completed status

**Alternative Flows:**
- 4a. Task not found → Return 404 Not Found
- 4b. Task belongs to another user → Return 403 Forbidden

### Use Case 6: Uncomplete Task

**Actor:** Authenticated User

**Preconditions:**
- User is authenticated (valid JWT token)
- Task exists, belongs to user, and is completed

**Main Flow:**
1. User unchecks checkbox or clicks "Mark Incomplete"
2. Frontend sends PATCH request to `/api/{user_id}/tasks/{task_id}/uncomplete` with JWT
3. Backend verifies JWT and extracts user_id
4. Backend verifies task exists and user_id matches
5. Backend calls `UncompleteTaskUseCase.execute(task_id)`
6. Repository updates `completed=false` and `updated_at`
7. Backend returns 200 OK with updated task JSON
8. Frontend updates UI (removes strikethrough)

**Postconditions:**
- Task is marked as pending in database
- UI reflects pending status

**Alternative Flows:**
- 4a. Task not found → Return 404 Not Found
- 4b. Task belongs to another user → Return 403 Forbidden

---

## Business Rules

### BR-1: User Ownership

**Rule:** Every task MUST belong to exactly one user

**Rationale:** Ensures data isolation and privacy

**Implementation:**
- `tasks.user_id` is NOT NULL foreign key
- Repository always filters by user_id
- API always verifies user_id from JWT matches URL user_id

**Validation:**
```python
# ✅ CORRECT
def get_tasks(authenticated_user_id: str):
    return db.query(Task).filter_by(user_id=authenticated_user_id).all()

# ❌ WRONG - No user filtering
def get_tasks():
    return db.query(Task).all()  # SECURITY HOLE!
```

### BR-2: Title Requirement

**Rule:** Every task MUST have a non-empty title

**Rationale:** Tasks without titles are meaningless

**Implementation:**
- Title is required field (NOT NULL in database)
- Frontend enforces required field
- Backend validates 1-200 characters

**Validation:**
```python
if not title or len(title) == 0:
    raise ValidationError("Title is required")
if len(title) > 200:
    raise ValidationError("Title cannot exceed 200 characters")
```

### BR-3: Description Optionality

**Rule:** Task description is optional

**Rationale:** Not all tasks need detailed descriptions

**Implementation:**
- Description can be empty string or null
- If provided, must be 0-1000 characters

**Validation:**
```python
if description and len(description) > 1000:
    raise ValidationError("Description cannot exceed 1000 characters")
```

### BR-4: Immutable Creation Time

**Rule:** Task creation timestamp MUST NOT change

**Rationale:** Audit trail and historical accuracy

**Implementation:**
- `created_at` set once on creation
- No setter method in Task entity
- Database column has DEFAULT NOW()

### BR-5: Automatic Update Time

**Rule:** Task update timestamp MUST update on every modification

**Rationale:** Track when tasks were last modified

**Implementation:**
- `updated_at` updates on every UPDATE operation
- Repository sets timestamp automatically

### BR-6: Unique Task IDs

**Rule:** Every task MUST have a unique ID within the system

**Rationale:** Unambiguous task identification

**Implementation:**
- Database SERIAL PRIMARY KEY
- Auto-incremented by PostgreSQL

---

## Validation Rules

### VR-1: Title Validation

**Field:** `title`

**Rules:**
- Required: YES
- Type: String
- Min Length: 1 character
- Max Length: 200 characters
- Allowed Characters: Any UTF-8

**Error Messages:**
- Empty: "Title is required"
- Too Short: "Title must be at least 1 character"
- Too Long: "Title cannot exceed 200 characters"

### VR-2: Description Validation

**Field:** `description`

**Rules:**
- Required: NO
- Type: String
- Min Length: 0 characters
- Max Length: 1000 characters
- Allowed Characters: Any UTF-8

**Error Messages:**
- Too Long: "Description cannot exceed 1000 characters"

### VR-3: Task ID Validation

**Field:** `id` (in URL parameters)

**Rules:**
- Required: YES (for single-task operations)
- Type: Integer
- Min Value: 1

**Error Messages:**
- Invalid: "Task ID must be a positive integer"
- Not Found: "Task not found"

### VR-4: User ID Validation

**Field:** `user_id` (from JWT and URL)

**Rules:**
- Required: YES
- Type: String (UUID or identifier from Better Auth)
- Match: URL user_id MUST match JWT user_id

**Error Messages:**
- Mismatch: "Forbidden: Cannot access another user's tasks"
- Missing: "Unauthorized: Authentication required"

---

## Error Handling

### Error Categories

#### 1. Validation Errors (400 Bad Request)

**Trigger:** Invalid input data

**Response Format:**
```json
{
  "error": "Validation Error",
  "details": {
    "title": "Title cannot exceed 200 characters"
  }
}
```

**Examples:**
- Title too long
- Description too long
- Invalid task ID format

#### 2. Authentication Errors (401 Unauthorized)

**Trigger:** Missing or invalid JWT token

**Response Format:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Examples:**
- No Authorization header
- Invalid JWT signature
- Expired JWT token

#### 3. Authorization Errors (403 Forbidden)

**Trigger:** User trying to access another user's resources

**Response Format:**
```json
{
  "error": "Forbidden",
  "message": "Cannot access another user's tasks"
}
```

**Examples:**
- URL user_id doesn't match JWT user_id
- Task belongs to different user

#### 4. Not Found Errors (404 Not Found)

**Trigger:** Requested resource doesn't exist

**Response Format:**
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

**Examples:**
- Task ID doesn't exist in database
- Task was deleted

#### 5. Server Errors (500 Internal Server Error)

**Trigger:** Unexpected server-side error

**Response Format:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

**Logging:**
- Full stack trace logged server-side
- Error ID returned to client for support

---

## Acceptance Criteria

### AC-1: Create Task

**Given:** I am a logged-in user
**When:** I submit a task with title "Buy groceries"
**Then:**
- Task is created with status "pending"
- Task has a unique ID
- Task has created_at and updated_at timestamps
- Task is associated with my user_id
- Task appears in my task list
- Other users cannot see this task

### AC-2: View Task List

**Given:** I am a logged-in user with 3 tasks
**When:** I view my task list
**Then:**
- I see exactly 3 tasks (my tasks)
- I do not see tasks from other users
- Tasks display ID, title, description (truncated), status
- Tasks are sorted by creation date (newest first)

### AC-3: Update Task

**Given:** I am a logged-in user with a task "Old Title"
**When:** I update the title to "New Title"
**Then:**
- Task title changes to "New Title"
- Task updated_at timestamp is updated
- Task created_at timestamp remains unchanged
- Changes are persisted to database
- I see "New Title" in my task list

### AC-4: Delete Task

**Given:** I am a logged-in user with a task
**When:** I delete the task
**Then:**
- Task is removed from database
- Task no longer appears in my task list
- Task cannot be retrieved by ID
- Deletion is permanent

### AC-5: Complete Task

**Given:** I am a logged-in user with a pending task
**When:** I mark the task as complete
**Then:**
- Task status changes to "completed"
- Task updated_at timestamp is updated
- UI shows task as completed (e.g., strikethrough, checkmark)
- Changes are persisted to database

### AC-6: Uncomplete Task

**Given:** I am a logged-in user with a completed task
**When:** I mark the task as incomplete
**Then:**
- Task status changes to "pending"
- Task updated_at timestamp is updated
- UI shows task as pending (removes strikethrough)
- Changes are persisted to database

### AC-7: Authorization Enforcement

**Given:** I am User A and a task belongs to User B
**When:** I try to view/update/delete User B's task
**Then:**
- Request is rejected with 403 Forbidden
- No data is returned
- No changes are made
- User B's task remains unchanged

### AC-8: Authentication Enforcement

**Given:** I am not logged in (no JWT token)
**When:** I try to access any task endpoint
**Then:**
- Request is rejected with 401 Unauthorized
- No data is returned
- User is prompted to login

---

## Appendix: Phase I Compatibility Matrix

### Use Cases (MUST REMAIN UNCHANGED)

| Use Case | Phase I Interface | Phase II Usage |
|----------|------------------|----------------|
| `AddTaskUseCase` | `execute(title: str, description: str) -> Task` | ✅ Same interface, called by API |
| `ListTasksUseCase` | `execute() -> List[Task]` | ✅ Same interface, repository filters by user_id |
| `UpdateTaskUseCase` | `execute(task_id: int, title: str, description: str) -> Task` | ✅ Same interface, called by API |
| `DeleteTaskUseCase` | `execute(task_id: int) -> None` | ✅ Same interface, called by API |
| `CompleteTaskUseCase` | `execute(task_id: int) -> Task` | ✅ Same interface, called by API |
| `UncompleteTaskUseCase` | `execute(task_id: int) -> Task` | ✅ Same interface, called by API |

### Repository Interface (EXTENDED, NOT CHANGED)

**Phase I:**
```python
class TaskRepository(ABC):
    def add(self, task: Task) -> Task: ...
    def get_by_id(self, task_id: int) -> Optional[Task]: ...
    def get_all(self) -> List[Task]: ...
    def update(self, task: Task) -> Task: ...
    def delete(self, task_id: int) -> None: ...
```

**Phase II:**
```python
# Same interface, but implementations filter by user_id internally
class PostgreSQLTaskRepository(TaskRepository):
    def __init__(self, db_session, user_id: str):  # NEW: user_id context
        self.db = db_session
        self.user_id = user_id  # NEW: stored for filtering

    def get_all(self) -> List[Task]:
        # Automatically filters by self.user_id
        db_tasks = self.db.query(TaskDB).filter_by(user_id=self.user_id).all()
        return [self._to_domain(t) for t in db_tasks]
```

---

**Document Status:** Complete
**Dependencies:** overview.md, CONSTITUTION_PHASE2.md
**Next Specs:** authentication.md, task-ownership.md
**Implementation:** Not started (spec-only phase)

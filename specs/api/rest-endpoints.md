# API Specification: REST Endpoints

**Version:** 1.0
**Date:** January 3, 2026
**API:** Todo App REST API
**Base URL:** `http://localhost:8000` (development) / `https://api.todo-app.com` (production)
**Status:** Specification

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Endpoint Reference](#endpoint-reference)
4. [Request/Response Contracts](#requestresponse-contracts)
5. [Error Handling](#error-handling)
6. [HTTP Status Codes](#http-status-codes)
7. [API Examples](#api-examples)

---

## API Overview

### API Design Principles

**RESTful Design:**
- Resources identified by URLs (e.g., `/api/{user_id}/tasks/{task_id}`)
- HTTP methods define operations (GET, POST, PUT, DELETE, PATCH)
- Stateless requests (all state in JWT)
- Standard HTTP status codes

**Security First:**
- All endpoints require JWT authentication
- User-scoped resources (user_id in URL)
- Authorization verified on every request
- HTTPS only in production

**Consistency:**
- Predictable URL structure
- Consistent error format
- Standard HTTP semantics
- JSON request/response bodies

### Base URL

| Environment | Base URL |
|-------------|----------|
| **Development** | `http://localhost:8000` |
| **Production** | `https://api.todo-app.com` |

### API Versioning

**Current Version:** v1 (implicit, no version in URL)

**Future:** If breaking changes needed, use `/api/v2/...`

---

## Authentication

### Authentication Mechanism

**Method:** JWT (JSON Web Token) in Authorization header

**Header Format:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Token Requirements:**
- Must be valid JWT signed with BETTER_AUTH_SECRET
- Must not be expired (exp claim)
- Must contain user_id in sub claim

### Authentication Flow

```
1. Frontend obtains JWT from Better Auth (login/register)
2. Frontend includes JWT in Authorization header
3. Backend extracts JWT from header
4. Backend verifies signature and expiration
5. Backend extracts user_id from sub claim
6. Backend uses user_id for authorization
```

### Unauthenticated Requests

**Missing Token:**
```http
GET /api/user-123/tasks
```

**Response:** 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Invalid Token:**
```http
GET /api/user-123/tasks
Authorization: Bearer invalid-token
```

**Response:** 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

**Expired Token:**
```http
GET /api/user-123/tasks
Authorization: Bearer <expired-jwt>
```

**Response:** 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Token expired"
}
```

---

## Endpoint Reference

### Summary Table

| Method | Endpoint | Description | Auth | Returns |
|--------|----------|-------------|------|---------|
| **GET** | `/api/{user_id}/tasks` | List all user's tasks | Required | 200 + Task[] |
| **POST** | `/api/{user_id}/tasks` | Create new task | Required | 201 + Task |
| **GET** | `/api/{user_id}/tasks/{id}` | Get single task | Required | 200 + Task |
| **PUT** | `/api/{user_id}/tasks/{id}` | Update task | Required | 200 + Task |
| **DELETE** | `/api/{user_id}/tasks/{id}` | Delete task | Required | 204 |
| **PATCH** | `/api/{user_id}/tasks/{id}/complete` | Mark task complete | Required | 200 + Task |
| **PATCH** | `/api/{user_id}/tasks/{id}/uncomplete` | Mark task incomplete | Required | 200 + Task |
| **GET** | `/health` | Health check | None | 200 + Status |

---

### 1. List Tasks

**Endpoint:** `GET /api/{user_id}/tasks`

**Description:** Retrieve all tasks for authenticated user

**Path Parameters:**
- `user_id` (string, required): User identifier (must match JWT sub claim)

**Query Parameters:**
- `completed` (boolean, optional): Filter by completion status
  - `true`: Only completed tasks
  - `false`: Only pending tasks
  - omit: All tasks
- `sort` (string, optional): Sort order
  - `created_at_desc` (default): Newest first
  - `created_at_asc`: Oldest first
  - `title_asc`: Alphabetical by title

**Request Headers:**
```
Authorization: Bearer <JWT>
```

**Request Example:**
```http
GET /api/user-123/tasks?completed=false&sort=created_at_desc HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
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

**Response: 401 Unauthorized** (missing/invalid JWT)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Response: 403 Forbidden** (user_id mismatch)
```json
{
  "error": "Forbidden",
  "message": "Cannot access another user's tasks"
}
```

---

### 2. Create Task

**Endpoint:** `POST /api/{user_id}/tasks`

**Description:** Create new task for authenticated user

**Path Parameters:**
- `user_id` (string, required): User identifier (must match JWT)

**Request Headers:**
```
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Request Body Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | Yes | 1-200 characters |
| `description` | string | No | 0-1000 characters |

**Request Example:**
```http
POST /api/user-123/tasks HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response: 201 Created**
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

**Response: 400 Bad Request** (validation error)
```json
{
  "error": "Validation Error",
  "details": {
    "title": "Title is required",
    "description": "Description cannot exceed 1000 characters"
  }
}
```

**Response: 401 Unauthorized** (missing/invalid JWT)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Response: 403 Forbidden** (user_id mismatch)
```json
{
  "error": "Forbidden",
  "message": "Cannot create tasks for another user"
}
```

---

### 3. Get Single Task

**Endpoint:** `GET /api/{user_id}/tasks/{id}`

**Description:** Retrieve single task by ID (must belong to user)

**Path Parameters:**
- `user_id` (string, required): User identifier
- `id` (integer, required): Task ID

**Request Headers:**
```
Authorization: Bearer <JWT>
```

**Request Example:**
```http
GET /api/user-123/tasks/42 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
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

**Response: 401 Unauthorized** (missing/invalid JWT)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Response: 403 Forbidden** (user_id mismatch)
```json
{
  "error": "Forbidden",
  "message": "Cannot access another user's tasks"
}
```

**Response: 404 Not Found** (task doesn't exist or belongs to another user)
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

---

### 4. Update Task

**Endpoint:** `PUT /api/{user_id}/tasks/{id}`

**Description:** Update task title and/or description

**Path Parameters:**
- `user_id` (string, required): User identifier
- `id` (integer, required): Task ID

**Request Headers:**
```
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Buy groceries and cook",
  "description": "Milk, eggs, bread, chicken"
}
```

**Request Body Schema:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | No* | 1-200 characters |
| `description` | string | No | 0-1000 characters |

*At least one field must be provided

**Request Example:**
```http
PUT /api/user-123/tasks/42 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries and cook",
  "description": "Milk, eggs, bread, chicken"
}
```

**Response: 200 OK**
```json
{
  "id": 42,
  "title": "Buy groceries and cook",
  "description": "Milk, eggs, bread, chicken",
  "completed": false,
  "created_at": "2026-01-03T10:30:00Z",
  "updated_at": "2026-01-03T11:15:00Z"
}
```

**Response: 400 Bad Request** (validation error)
```json
{
  "error": "Validation Error",
  "details": {
    "title": "Title cannot exceed 200 characters"
  }
}
```

**Response: 401 Unauthorized** (missing/invalid JWT)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Response: 403 Forbidden** (user_id mismatch)
```json
{
  "error": "Forbidden",
  "message": "Cannot update another user's tasks"
}
```

**Response: 404 Not Found** (task doesn't exist or belongs to another user)
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

---

### 5. Delete Task

**Endpoint:** `DELETE /api/{user_id}/tasks/{id}`

**Description:** Permanently delete task

**Path Parameters:**
- `user_id` (string, required): User identifier
- `id` (integer, required): Task ID

**Request Headers:**
```
Authorization: Bearer <JWT>
```

**Request Example:**
```http
DELETE /api/user-123/tasks/42 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 204 No Content**
```
(empty body)
```

**Response: 401 Unauthorized** (missing/invalid JWT)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Response: 403 Forbidden** (user_id mismatch)
```json
{
  "error": "Forbidden",
  "message": "Cannot delete another user's tasks"
}
```

**Response: 404 Not Found** (task doesn't exist or belongs to another user)
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

---

### 6. Mark Task Complete

**Endpoint:** `PATCH /api/{user_id}/tasks/{id}/complete`

**Description:** Mark task as completed

**Path Parameters:**
- `user_id` (string, required): User identifier
- `id` (integer, required): Task ID

**Request Headers:**
```
Authorization: Bearer <JWT>
```

**Request Body:** None

**Request Example:**
```http
PATCH /api/user-123/tasks/42/complete HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
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

**Response: 401 Unauthorized** (missing/invalid JWT)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Response: 403 Forbidden** (user_id mismatch)
```json
{
  "error": "Forbidden",
  "message": "Cannot modify another user's tasks"
}
```

**Response: 404 Not Found** (task doesn't exist or belongs to another user)
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

---

### 7. Mark Task Incomplete

**Endpoint:** `PATCH /api/{user_id}/tasks/{id}/uncomplete`

**Description:** Mark task as pending (uncomplete)

**Path Parameters:**
- `user_id` (string, required): User identifier
- `id` (integer, required): Task ID

**Request Headers:**
```
Authorization: Bearer <JWT>
```

**Request Body:** None

**Request Example:**
```http
PATCH /api/user-123/tasks/42/uncomplete HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "id": 42,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-03T10:30:00Z",
  "updated_at": "2026-01-03T11:35:00Z"
}
```

**Response: 401/403/404:** Same as "Mark Complete" endpoint

---

### 8. Health Check

**Endpoint:** `GET /health`

**Description:** API health check (no authentication required)

**Request Headers:** None

**Request Example:**
```http
GET /health HTTP/1.1
Host: localhost:8000
```

**Response: 200 OK**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-03T11:40:00Z"
}
```

**Response: 503 Service Unavailable** (if database is down)
```json
{
  "status": "unhealthy",
  "error": "Database connection failed"
}
```

---

## Request/Response Contracts

### Task Object Schema

**JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "Unique task identifier",
      "example": 42
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Task title",
      "example": "Buy groceries"
    },
    "description": {
      "type": "string",
      "maxLength": 1000,
      "description": "Task description (optional)",
      "example": "Milk, eggs, bread"
    },
    "completed": {
      "type": "boolean",
      "description": "Completion status",
      "example": false
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Creation timestamp (ISO 8601)",
      "example": "2026-01-03T10:30:00Z"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "description": "Last update timestamp (ISO 8601)",
      "example": "2026-01-03T10:30:00Z"
    }
  },
  "required": ["id", "title", "completed", "created_at", "updated_at"]
}
```

### TypeScript Type Definitions

```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;  // ISO 8601 format
  updated_at: string;  // ISO 8601 format
}

interface CreateTaskRequest {
  title: string;       // 1-200 chars
  description?: string; // 0-1000 chars, optional
}

interface UpdateTaskRequest {
  title?: string;       // 1-200 chars, optional
  description?: string; // 0-1000 chars, optional
}

interface TaskListResponse {
  tasks: Task[];
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string>;
}
```

### Content Type

**Request:**
- `Content-Type: application/json` (for POST, PUT)

**Response:**
- `Content-Type: application/json` (always)

### Date/Time Format

**ISO 8601 with UTC timezone:**
- Format: `YYYY-MM-DDTHH:mm:ssZ`
- Example: `2026-01-03T10:30:00Z`
- Timezone: Always UTC (Z suffix)

---

## Error Handling

### Error Response Format

**Standard Error Response:**
```json
{
  "error": "Error Category",
  "message": "Human-readable error message",
  "details": {
    "field1": "Field-specific error",
    "field2": "Another error"
  }
}
```

### Error Categories

#### 1. Validation Errors (400 Bad Request)

**Trigger:** Invalid input data

**Example:**
```json
{
  "error": "Validation Error",
  "message": "Invalid input",
  "details": {
    "title": "Title cannot exceed 200 characters",
    "description": "Description cannot exceed 1000 characters"
  }
}
```

#### 2. Authentication Errors (401 Unauthorized)

**Trigger:** Missing, invalid, or expired JWT

**Examples:**
```json
// Missing token
{
  "error": "Unauthorized",
  "message": "Authentication required"
}

// Invalid token
{
  "error": "Unauthorized",
  "message": "Invalid token"
}

// Expired token
{
  "error": "Unauthorized",
  "message": "Token expired"
}
```

#### 3. Authorization Errors (403 Forbidden)

**Trigger:** User trying to access another user's resources

**Example:**
```json
{
  "error": "Forbidden",
  "message": "Cannot access another user's tasks"
}
```

#### 4. Not Found Errors (404 Not Found)

**Trigger:** Resource doesn't exist or doesn't belong to user

**Example:**
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

**Security Note:** Same error whether task doesn't exist or belongs to another user (fail secure)

#### 5. Server Errors (500 Internal Server Error)

**Trigger:** Unexpected server-side error

**Example:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "request_id": "req_abc123def456"
}
```

**Logging:** Full stack trace logged server-side; request_id for support

---

## HTTP Status Codes

### Success Codes

| Code | Status | Usage |
|------|--------|-------|
| **200** | OK | Successful GET, PUT, PATCH |
| **201** | Created | Successful POST (resource created) |
| **204** | No Content | Successful DELETE |

### Client Error Codes

| Code | Status | Usage |
|------|--------|-------|
| **400** | Bad Request | Invalid input (validation errors) |
| **401** | Unauthorized | Missing/invalid/expired authentication |
| **403** | Forbidden | Valid auth but not authorized for resource |
| **404** | Not Found | Resource doesn't exist (or unauthorized) |
| **422** | Unprocessable Entity | Business rule violation |
| **429** | Too Many Requests | Rate limit exceeded |

### Server Error Codes

| Code | Status | Usage |
|------|--------|-------|
| **500** | Internal Server Error | Unexpected server error |
| **503** | Service Unavailable | Database down, maintenance mode |

---

## API Examples

### Example 1: Complete Task Workflow

**1. Create a task:**
```bash
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

**Response:**
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

**2. List tasks:**
```bash
curl -X GET http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
[
  {
    "id": 42,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-03T10:30:00Z",
    "updated_at": "2026-01-03T10:30:00Z"
  }
]
```

**3. Mark task complete:**
```bash
curl -X PATCH http://localhost:8000/api/user-123/tasks/42/complete \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "id": 42,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-03T10:30:00Z",
  "updated_at": "2026-01-03T11:00:00Z"
}
```

**4. Delete task:**
```bash
curl -X DELETE http://localhost:8000/api/user-123/tasks/42 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```
HTTP/1.1 204 No Content
```

### Example 2: Error Handling

**Attempt to access another user's task:**
```bash
curl -X GET http://localhost:8000/api/user-456/tasks \
  -H "Authorization: Bearer <user-123-jwt-token>"
```

**Response:**
```json
HTTP/1.1 403 Forbidden

{
  "error": "Forbidden",
  "message": "Cannot access another user's tasks"
}
```

**Validation error:**
```bash
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "description": "A very long description that exceeds the 1000 character limit..."
  }'
```

**Response:**
```json
HTTP/1.1 400 Bad Request

{
  "error": "Validation Error",
  "message": "Invalid input",
  "details": {
    "title": "Title is required",
    "description": "Description cannot exceed 1000 characters"
  }
}
```

---

## Appendix: OpenAPI Specification

### OpenAPI 3.0 Schema (Partial)

```yaml
openapi: 3.0.0
info:
  title: Todo App API
  version: 1.0.0
  description: RESTful API for multi-user task management

servers:
  - url: http://localhost:8000
    description: Development server
  - url: https://api.todo-app.com
    description: Production server

security:
  - BearerAuth: []

paths:
  /api/{user_id}/tasks:
    get:
      summary: List all tasks for user
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
        - name: completed
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

    post:
      summary: Create new task
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Task:
      type: object
      properties:
        id:
          type: integer
        title:
          type: string
          minLength: 1
          maxLength: 200
        description:
          type: string
          maxLength: 1000
        completed:
          type: boolean
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    CreateTaskRequest:
      type: object
      required:
        - title
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 200
        description:
          type: string
          maxLength: 1000
```

---

**Document Status:** Complete
**Dependencies:** features/task-crud.md, features/authentication.md, overview.md
**Related Specs:** database/schema.md, ui/pages.md
**Implementation:** Not started (spec-only phase)

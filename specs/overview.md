# Phase II System Overview Specification

**Version:** 1.0
**Date:** January 3, 2026
**Project:** Todo App - Phase II Full-Stack Web Application
**Status:** Specification

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Vision](#system-vision)
3. [Full-Stack Architecture](#full-stack-architecture)
4. [Request Flow](#request-flow)
5. [Authentication Flow](#authentication-flow)
6. [Data Flow](#data-flow)
7. [Technology Stack](#technology-stack)
8. [System Boundaries](#system-boundaries)
9. [Non-Functional Requirements](#non-functional-requirements)
10. [Success Criteria](#success-criteria)

---

## Executive Summary

Phase II transforms the Phase I console application into a **Full-Stack Web Application** with multi-user support, persistent storage, authentication, and a responsive web interface.

### Key Transformations

| Aspect | Phase I | Phase II |
|--------|---------|----------|
| **Interface** | CLI (Python `input()`) | Web UI (Next.js) |
| **Storage** | In-memory (Python dict) | PostgreSQL (Neon) |
| **Users** | Single user | Multi-user with isolation |
| **Authentication** | None | Better Auth + JWT |
| **API** | Direct function calls | REST API (FastAPI) |
| **Architecture** | 4-layer (local) | Full-stack (distributed) |

### Core Requirements

1. ✅ All 5 basic CRUD features (Add, Delete, Update, View, Mark Complete)
2. ✅ Multi-user support with complete data isolation
3. ✅ Persistent storage (Neon PostgreSQL + SQLModel)
4. ✅ Authentication (Better Auth + JWT)
5. ✅ REST API (FastAPI, user-scoped, JWT-protected)
6. ✅ Responsive Web UI (Next.js App Router)

---

## System Vision

### What We're Building

A **secure, multi-user, full-stack Todo application** where:
- Users can register and authenticate securely
- Each user has their own isolated task list
- Tasks persist across sessions in a cloud database
- Users access tasks through a modern web interface
- All operations are secure, authenticated, and user-scoped

### What Makes This Different from Phase I

**Phase I:** Single-user, in-memory, console-based
```
User → CLI (input/print) → Use Cases → In-Memory Repository → Python Dict
```

**Phase II:** Multi-user, persistent, web-based
```
User → Web UI (Next.js) → API (FastAPI) → Use Cases → Database Repository → PostgreSQL
                ↓                           ↑
           Better Auth                   JWT Verify
```

---

## Full-Stack Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (Port 3000)                  │  │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐    │  │
│  │  │   Better Auth       │  │   React Components       │    │  │
│  │  │  (Authentication)   │  │  (UI + State Management) │    │  │
│  │  └─────────────────────┘  └──────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTPS + JWT
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Port 8000)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Presentation Layer                       │  │
│  │              (REST API + JWT Middleware)                   │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│  ┌───────────────────────────┴────────────────────────────────┐ │
│  │                   Application Layer                        │ │
│  │            (Use Cases - FROM PHASE I, UNCHANGED)           │ │
│  └──────────────────────────┬────────────────────────────────┘ │
│  ┌───────────────────────────┴────────────────────────────────┐ │
│  │                   Domain Layer                             │ │
│  │            (Entities - FROM PHASE I, UNCHANGED)            │ │
│  └──────────────────────────┬────────────────────────────────┘ │
│  ┌───────────────────────────┴────────────────────────────────┐ │
│  │                Infrastructure Layer                        │ │
│  │             (SQLModel Repository - NEW)                    │ │
│  └──────────────────────────┬────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ SQL over TLS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              Neon Serverless PostgreSQL (Cloud)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   Tables: users (Better Auth), tasks (user-scoped)        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### Frontend (Next.js)
- **Presentation**: Render UI components
- **Authentication**: Better Auth session management
- **State Management**: React state + Server Components
- **API Client**: Fetch data from backend with JWT

#### Backend (FastAPI)
- **API Gateway**: Expose REST endpoints
- **Authentication**: Verify JWT tokens
- **Business Logic**: Use Cases (from Phase I)
- **Data Access**: Repository pattern (SQLModel)

#### Database (Neon PostgreSQL)
- **Persistence**: Store users and tasks
- **Integrity**: Foreign keys, constraints
- **Isolation**: Row-level security (user_id filtering)

---

## Request Flow

### Complete Request Lifecycle

```
1. User Action (Browser)
   │
   ├─> User clicks "Add Task" button
   │
   ↓
2. Frontend (Next.js)
   │
   ├─> React component handles click event
   ├─> Retrieves JWT token from Better Auth session
   ├─> Sends POST request to backend API
   │   Headers: Authorization: Bearer <JWT>
   │   Body: { title: "...", description: "..." }
   │
   ↓
3. API Gateway (FastAPI Presentation Layer)
   │
   ├─> Receives request at POST /api/{user_id}/tasks
   ├─> Extracts JWT from Authorization header
   ├─> Verifies JWT signature using BETTER_AUTH_SECRET
   ├─> Decodes JWT to get user_id
   ├─> Validates user_id in URL matches user_id in JWT
   │   (If mismatch → 403 Forbidden)
   │
   ↓
4. Application Layer (Use Cases)
   │
   ├─> Calls AddTaskUseCase.execute()
   ├─> Validates title (1-200 chars)
   ├─> Validates description (0-1000 chars)
   ├─> Creates Task entity (Domain)
   │
   ↓
5. Infrastructure Layer (Repository)
   │
   ├─> Calls PostgreSQLTaskRepository.add(task, user_id)
   ├─> Creates SQLModel Task instance
   ├─> Adds user_id foreign key
   ├─> Commits to database
   │
   ↓
6. Database (Neon PostgreSQL)
   │
   ├─> Inserts row into tasks table
   ├─> Validates foreign key (user exists)
   ├─> Returns inserted task with ID
   │
   ↓
7. Response Flow (Reverse)
   │
   ├─> Repository returns Task entity
   ├─> Use Case returns success
   ├─> API returns 201 Created with task JSON
   ├─> Frontend receives response
   ├─> UI updates to show new task
   │
   ✓
8. User sees new task in list
```

### Request Flow Patterns

**Pattern 1: Authenticated Data Access**
```
Frontend → JWT in header → Backend verifies → Use Case → Repository filters by user_id → Database
```

**Pattern 2: Unauthenticated Request**
```
Frontend → No JWT → Backend rejects → 401 Unauthorized
```

**Pattern 3: Unauthorized Access**
```
Frontend → JWT (user A) → Backend verifies → URL has user B → 403 Forbidden
```

---

## Authentication Flow

### Registration Flow

```
1. User enters email/password on signup page
   │
   ↓
2. Frontend calls Better Auth signup API
   │
   ├─> Better Auth validates email format
   ├─> Better Auth hashes password (bcrypt)
   ├─> Better Auth inserts user into database
   ├─> Better Auth creates session
   ├─> Better Auth generates JWT token
   │
   ↓
3. Better Auth returns JWT to frontend
   │
   ↓
4. Frontend stores JWT in memory/cookie
   │
   ↓
5. User is logged in ✓
```

### Login Flow

```
1. User enters credentials on login page
   │
   ↓
2. Frontend calls Better Auth login API
   │
   ├─> Better Auth finds user by email
   ├─> Better Auth verifies password hash
   ├─> Better Auth creates session
   ├─> Better Auth generates JWT token
   │   Payload: { sub: user_id, email: ..., exp: ... }
   │   Signed with: BETTER_AUTH_SECRET
   │
   ↓
3. Better Auth returns JWT to frontend
   │
   ↓
4. Frontend stores JWT in session
   │
   ↓
5. User is authenticated ✓
```

### API Request Authentication Flow

```
1. Frontend needs to fetch tasks
   │
   ↓
2. Frontend retrieves JWT from session
   │
   ↓
3. Frontend makes request:
   │
   GET /api/user-123/tasks
   Headers:
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   │
   ↓
4. Backend JWT Middleware (FastAPI Dependency)
   │
   ├─> Extracts token from Authorization header
   ├─> Verifies signature using BETTER_AUTH_SECRET
   ├─> Checks expiration (exp claim)
   ├─> Decodes payload to get user_id
   │
   ↓
5. Backend Endpoint Handler
   │
   ├─> Receives authenticated user_id from middleware
   ├─> Validates URL user_id == token user_id
   ├─> If match: proceed
   ├─> If mismatch: 403 Forbidden
   │
   ↓
6. Request proceeds to Use Case layer
```

### Logout Flow

```
1. User clicks logout
   │
   ↓
2. Frontend calls Better Auth logout API
   │
   ↓
3. Better Auth invalidates session
   │
   ↓
4. Frontend clears JWT from storage
   │
   ↓
5. User is logged out ✓
```

---

## Data Flow

### Task Creation Data Flow

```
Frontend Form State
├─ title: string
├─ description: string
└─ completed: false (default)
   │
   │ Transform to API request
   ↓
API Request (JSON)
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
   │
   │ Validate and create Domain Entity
   ↓
Domain Entity (Task)
├─ id: auto-generated
├─ title: "Buy groceries"
├─ description: "Milk, eggs, bread"
├─ status: PENDING
├─ created_at: 2026-01-03T10:30:00Z
└─ (no user_id - domain is user-agnostic)
   │
   │ Add infrastructure context
   ↓
Database Model (SQLModel)
├─ id: serial primary key
├─ user_id: "user-123" (foreign key)
├─ title: "Buy groceries"
├─ description: "Milk, eggs, bread"
├─ completed: false
├─ created_at: 2026-01-03T10:30:00Z
└─ updated_at: 2026-01-03T10:30:00Z
   │
   │ Persist to database
   ↓
Database Row (PostgreSQL)
| id | user_id  | title          | description        | completed | created_at | updated_at |
|----|----------|----------------|--------------------|-----------|------------|------------|
| 42 | user-123 | Buy groceries  | Milk, eggs, bread  | false     | 2026-01-03 | 2026-01-03 |
   │
   │ Return to frontend
   ↓
API Response (JSON)
{
  "id": 42,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-03T10:30:00Z",
  "updated_at": "2026-01-03T10:30:00Z"
}
   │
   │ Update UI state
   ↓
Frontend Display
[x] Buy groceries
    Milk, eggs, bread
    Created: Jan 3, 2026
```

### Data Transformation Layers

| Layer | Representation | Example |
|-------|----------------|---------|
| **UI State** | React state object | `{ title: "...", description: "..." }` |
| **API Request** | JSON | `{ "title": "...", "description": "..." }` |
| **Domain Entity** | Task class (Phase I) | `Task(id, title, description, status, created_at)` |
| **Database Model** | SQLModel schema | `TaskDB(id, user_id, title, description, completed, ...)` |
| **Database Row** | PostgreSQL record | `INSERT INTO tasks VALUES (...)` |

### Data Isolation Flow

```
User A Tasks:
┌─────────────────────────────────────┐
│ User A (user-123) logs in           │
│  ├─> JWT payload: { sub: "user-123" }│
│  ├─> Frontend requests tasks        │
│  ├─> Backend verifies JWT           │
│  ├─> Repository filters:            │
│  │   WHERE user_id = 'user-123'     │
│  └─> Returns only User A's tasks    │
└─────────────────────────────────────┘

User B Tasks:
┌─────────────────────────────────────┐
│ User B (user-456) logs in           │
│  ├─> JWT payload: { sub: "user-456" }│
│  ├─> Frontend requests tasks        │
│  ├─> Backend verifies JWT           │
│  ├─> Repository filters:            │
│  │   WHERE user_id = 'user-456'     │
│  └─> Returns only User B's tasks    │
└─────────────────────────────────────┘

Database View:
| id | user_id  | title       |
|----|----------|-------------|
| 1  | user-123 | Task A1     | ← User A sees this
| 2  | user-123 | Task A2     | ← User A sees this
| 3  | user-456 | Task B1     | ← User B sees this
| 4  | user-456 | Task B2     | ← User B sees this
```

---

## Technology Stack

### Complete Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend Framework** | Next.js | 16+ | React framework with App Router |
| **Frontend Language** | TypeScript | 5+ | Type-safe JavaScript |
| **UI Library** | React | 19+ | Component-based UI |
| **Styling** | Tailwind CSS | 3+ | Utility-first CSS |
| **Authentication (Frontend)** | Better Auth | Latest | Session + JWT management |
| **Backend Framework** | FastAPI | 0.100+ | Python async web framework |
| **Backend Language** | Python | 3.13+ | Backend logic |
| **ORM** | SQLModel | Latest | Type-safe ORM (SQLAlchemy + Pydantic) |
| **Database** | Neon PostgreSQL | Latest | Serverless PostgreSQL |
| **Authentication (Backend)** | JWT | PyJWT 2+ | Token verification |
| **API Documentation** | OpenAPI | 3.0 | Auto-generated from FastAPI |
| **HTTP Client** | fetch | Native | Frontend API calls |
| **Development** | Node.js | 20+ | Frontend build tools |
| **Package Manager (Frontend)** | npm/pnpm | Latest | Dependency management |
| **Package Manager (Backend)** | pip/uv | Latest | Python dependencies |

### Shared Configuration

**Environment Variables:**
```bash
# Shared between Frontend and Backend
BETTER_AUTH_SECRET=<shared-secret-key>  # For JWT signing/verification

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL=postgresql://user:pass@neon.tech/db
ALLOWED_ORIGINS=http://localhost:3000
```

---

## System Boundaries

### Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    UNTRUSTED ZONE                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  User's Browser                                        │  │
│  │  - Can be manipulated                                  │  │
│  │  - Cannot be trusted                                   │  │
│  │  - All input is suspect                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ HTTPS + JWT
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    TRUST BOUNDARY                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Gateway (FastAPI)                                 │  │
│  │  - Verifies JWT                                        │  │
│  │  - Validates all input                                 │  │
│  │  - Enforces authorization                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              │ Verified requests only
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    TRUSTED ZONE                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Application + Database                                │  │
│  │  - Only receives verified requests                     │  │
│  │  - Can trust user_id context                           │  │
│  │  - Still validates business rules                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Security Layers

**Layer 1: Frontend (Defense)**
- Client-side validation (UX only, not security)
- HTTPS enforcement
- Secure token storage
- CORS compliance

**Layer 2: API Gateway (Primary Security)**
- JWT verification (MUST verify)
- Authorization checks (user_id matching)
- Input validation
- Rate limiting
- CORS headers

**Layer 3: Application (Business Rules)**
- Domain validation (1-200 chars, etc.)
- Business logic enforcement
- Use case authorization

**Layer 4: Database (Data Integrity)**
- Foreign key constraints
- NOT NULL constraints
- Unique constraints
- Row-level security

---

## Non-Functional Requirements

### Performance

| Metric | Requirement |
|--------|-------------|
| **API Response Time** | < 200ms (p95) |
| **Page Load Time** | < 2s (first contentful paint) |
| **Database Query Time** | < 50ms (indexed queries) |
| **Concurrent Users** | 100+ simultaneous users |

### Scalability

- Stateless backend (horizontal scaling)
- Connection pooling (database)
- CDN for static assets (frontend)
- Serverless database (auto-scaling)

### Security

- HTTPS only (TLS 1.3)
- JWT expiration (1 hour)
- Password hashing (bcrypt, cost 12)
- SQL injection prevention (parameterized queries)
- XSS prevention (React auto-escaping)
- CSRF protection (SameSite cookies)

### Reliability

- 99.9% uptime target
- Graceful error handling
- Database backups (automatic)
- Health check endpoints

### Usability

- Responsive design (mobile, tablet, desktop)
- Accessible (WCAG 2.1 Level AA)
- Keyboard navigation support
- Loading states and error messages

---

## Success Criteria

### Functional Success Criteria

✅ **Feature Parity with Phase I**
- All 5 CRUD operations work (Add, Delete, Update, View, Mark Complete)

✅ **Multi-User Support**
- Multiple users can register and login
- Each user sees only their own tasks
- No data leakage between users

✅ **Persistent Storage**
- Tasks persist across sessions
- Data survives application restarts
- Database integrity maintained

✅ **Authentication**
- Users can register with email/password
- Users can login and logout
- JWT tokens are generated and verified correctly

✅ **API Security**
- All endpoints require authentication
- Unauthorized requests return 401
- Forbidden requests return 403

✅ **Web Interface**
- Users can perform all operations via web UI
- UI is responsive and user-friendly
- Real-time updates after operations

### Non-Functional Success Criteria

✅ **Architecture**
- Clean Architecture preserved (Domain + Application unchanged from Phase I)
- Separation of concerns maintained
- Dependency rules followed

✅ **Security**
- No authentication bypass possible
- No SQL injection vulnerabilities
- No XSS vulnerabilities
- Data isolation enforced at all layers

✅ **Performance**
- API responds within SLA (< 200ms)
- UI loads quickly (< 2s)
- Database queries are optimized

✅ **Spec-Driven**
- All code generated from specifications
- Zero manual coding
- Complete traceability from spec to code

### Acceptance Test Scenarios

**Scenario 1: User Registration and Login**
1. New user registers with email/password
2. User receives JWT token
3. User can access their task list
4. ✅ Pass if: User successfully authenticated

**Scenario 2: Task Creation**
1. Authenticated user creates a task
2. Task is saved to database with user_id
3. Task appears in user's task list
4. ✅ Pass if: Task created and visible only to creating user

**Scenario 3: Multi-User Isolation**
1. User A creates tasks
2. User B logs in separately
3. User B cannot see User A's tasks
4. ✅ Pass if: Complete data isolation verified

**Scenario 4: Unauthorized Access**
1. User A tries to access User B's tasks via API
2. Backend verifies JWT doesn't match user_id
3. Request is rejected with 403
4. ✅ Pass if: Authorization properly enforced

**Scenario 5: Unauthenticated Access**
1. Request without JWT token hits API
2. Backend rejects request
3. Returns 401 Unauthorized
4. ✅ Pass if: Authentication properly enforced

---

## Appendix: Phase I vs Phase II Comparison

### Architecture Evolution

**Phase I Architecture:**
```
CLI Input → Command Handler → Use Case → Repository → In-Memory Dict
```

**Phase II Architecture:**
```
Web UI → API Gateway → Use Case (SAME) → Repository (NEW) → PostgreSQL
  ↓                      ↑
Better Auth          JWT Verify
```

### File Structure Evolution

**Phase I:**
```
/src
├── domain/              # Entities, Value Objects
├── application/         # Use Cases
├── infrastructure/      # In-Memory Repository
└── presentation/        # CLI
```

**Phase II:**
```
/frontend                # NEW - Next.js
├── app/
├── components/
└── lib/

/backend
├── app/
│   ├── domain/          # FROM PHASE I (UNCHANGED)
│   ├── application/     # FROM PHASE I (UNCHANGED)
│   ├── infrastructure/  # NEW - PostgreSQL Repository
│   └── presentation/    # NEW - REST API
```

### Data Model Evolution

**Phase I:**
```python
tasks: Dict[int, Task] = {}  # In-memory
```

**Phase II:**
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,  -- NEW: Multi-user support
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

**Document Status:** Complete and ready for implementation
**Next Phase:** Feature Specifications
**Dependencies:** None (foundation specification)
**Validation:** Reviewed against CONSTITUTION_PHASE2.md ✅

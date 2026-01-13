# PROJECT CONSTITUTION - PHASE II
## Todo Full-Stack Web Application - Supreme Governance Document

**Version:** 2.0
**Date:** January 3, 2026
**Status:** Active
**Authority:** Supreme rulebook for Phase II development
**Scope:** Full-Stack Web Application with Multi-User Support
**Extends:** Phase I Constitution (CONSTITUTION.md)

---

## Table of Contents

- [Preamble](#preamble)
- [Article I: Phase II Vision and Mission](#article-i-phase-ii-vision-and-mission)
- [Article II: Architectural Principles](#article-ii-architectural-principles)
- [Article III: Security Rules](#article-iii-security-rules)
- [Article IV: Spec-Driven Workflow Rules](#article-iv-spec-driven-workflow-rules)
- [Article V: No-Manual-Code Constraint](#article-v-no-manual-code-constraint)
- [Article VI: Multi-User Data Isolation](#article-vi-multi-user-data-isolation)
- [Article VII: JWT Trust Boundaries](#article-vii-jwt-trust-boundaries)
- [Article VIII: Technology Stack Constraints](#article-viii-technology-stack-constraints)
- [Article IX: API Design Principles](#article-ix-api-design-principles)
- [Article X: Frontend Architecture](#article-x-frontend-architecture)
- [Article XI: Backend Architecture](#article-xi-backend-architecture)
- [Article XII: Database Design](#article-xii-database-design)
- [Article XIII: Authentication and Authorization](#article-xiii-authentication-and-authorization)
- [Article XIV: Monorepo Organization](#article-xiv-monorepo-organization)
- [Article XV: Development Workflow](#article-xv-development-workflow)
- [Article XVI: Testing Requirements](#article-xvi-testing-requirements)
- [Article XVII: Deployment Standards](#article-xvii-deployment-standards)
- [Article XVIII: Amendment Process](#article-xviii-amendment-process)
- [Appendix A: Phase I to Phase II Migration](#appendix-a-phase-i-to-phase-ii-migration)
- [Appendix B: Glossary](#appendix-b-glossary)
- [Appendix C: Decision Records](#appendix-c-decision-records)

---

## Preamble

**We, the architects of the Todo application Phase II**, building upon the solid foundation of Phase I's in-memory console application, do hereby establish this Constitution to govern the transformation into a production-ready, multi-user, full-stack web application that demonstrates professional cloud-native development practices while maintaining architectural integrity and spec-driven methodology.

**Purpose:** This Constitution extends Phase I governance to encompass web architecture, multi-user systems, persistent storage, authentication, and API design, while preserving the core principles of Clean Architecture and specification-driven development.

**Binding Nature:** All code, infrastructure, APIs, and deployment configurations MUST conform to the principles and rules set forth in this Constitution and its predecessor (Phase I Constitution).

**Inheritance:** This Constitution inherits and extends Phase I Constitution (CONSTITUTION.md). Where conflicts arise, Phase II Constitution takes precedence for Phase II-specific concerns.

---

## Article I: Phase II Vision and Mission

### Section 1.1: Phase II Objectives

Transform the Phase I console application into a **Full-Stack Web Application** with:

1. **Multi-User Support** - Isolated data per user, no leakage
2. **Persistent Storage** - Neon Serverless PostgreSQL database
3. **Authentication** - Better Auth with JWT token validation
4. **REST API** - Secure, authenticated FastAPI endpoints
5. **Web UI** - Responsive Next.js application with App Router
6. **Cloud Native** - Deployable, scalable, production-ready

### Section 1.2: Core Values (Extended from Phase I)

Phase II adds these immutable core values:

1. **Security First**: User data isolation is paramount
2. **Stateless Architecture**: JWT-based authentication, no server-side sessions
3. **API-Driven Design**: Frontend and backend communicate via REST API only
4. **Separation of Concerns**: Frontend and backend are independent services
5. **User Experience**: Responsive, intuitive web interface
6. **Production Readiness**: Deployable to real cloud environments
7. **Zero Trust**: Verify all requests, trust nothing by default
8. **Data Sovereignty**: Users own their data, complete isolation

### Section 1.3: Success Criteria

Phase II is considered successful when:

- ✅ All 5 basic CRUD operations work via web UI
- ✅ Multiple users can use the system simultaneously with complete data isolation
- ✅ Data persists across server restarts (Neon PostgreSQL)
- ✅ JWT authentication protects all API endpoints
- ✅ Frontend and backend deployed and accessible
- ✅ 100% spec-driven (zero manual code)
- ✅ Clean Architecture maintained (domain layer untouched)

---

## Article II: Architectural Principles

### Section 2.1: Clean Architecture Preservation (IMMUTABLE)

**The Dependency Rule from Phase I remains ABSOLUTE:**

```
Presentation (Next.js) ──▶ Application ──▶ Domain
         │                     │             ▲
         │                     │             │
         ▼                     ▼             │
    REST API ──────────▶ Infrastructure ────┘
    (FastAPI)         (Repositories, DB)
```

**Critical Constraint:**
- Domain layer from Phase I MUST remain 100% unchanged
- Application layer (use cases) MUST remain 100% unchanged
- Only infrastructure and presentation layers may change

**Validation Test:**
```python
# If these files change, architecture has FAILED:
src/domain/entities/task.py          # ❌ MUST NOT CHANGE
src/domain/value_objects/            # ❌ MUST NOT CHANGE
src/domain/exceptions.py             # ❌ MUST NOT CHANGE
src/application/use_cases/           # ❌ MUST NOT CHANGE
```

### Section 2.2: Monolithic Backend, Separate Frontend

**Architecture Pattern:**
```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                      │
│                 - User Interface                         │
│                 - Client-side routing                    │
│                 - Better Auth integration                │
│                 - JWT token management                   │
└────────────────────────┬────────────────────────────────┘
                         │
                    HTTP/JSON
                    (REST API)
                         │
┌────────────────────────▼────────────────────────────────┐
│             BACKEND (FastAPI + Clean Arch)               │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Presentation Layer                   │  │
│  │              - FastAPI Routes                     │  │
│  │              - JWT Middleware                     │  │
│  │              - Request/Response Models            │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        │                                 │
│  ┌─────────────────────▼─────────────────────────────┐  │
│  │              Application Layer                    │  │
│  │              - Use Cases (UNCHANGED)              │  │
│  │              - Repository Interfaces              │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        │                                 │
│  ┌─────────────────────▼─────────────────────────────┐  │
│  │              Domain Layer                         │  │
│  │              - Task Entity (UNCHANGED)            │  │
│  │              - TaskStatus (UNCHANGED)             │  │
│  │              - Exceptions (UNCHANGED)             │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        │                                 │
│  ┌─────────────────────▼─────────────────────────────┐  │
│  │              Infrastructure Layer                 │  │
│  │              - PostgreSQLTaskRepository (NEW)     │  │
│  │              - SQLModel Models                    │  │
│  │              - Database Connection                │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
                         ▼
              ┌────────────────────┐
              │  Neon PostgreSQL   │
              │   (External SaaS)  │
              └────────────────────┘
```

### Section 2.3: Separation of Responsibilities

**Frontend Responsibilities (Next.js):**
- User interface rendering
- Client-side routing
- Form validation (UX layer only)
- Better Auth integration (session management)
- JWT token storage and transmission
- API client for backend communication
- Loading states and error messages

**Backend Responsibilities (FastAPI):**
- Business logic execution (via use cases)
- JWT token verification
- User identification from token
- Data filtering by user ID
- Database operations
- API endpoint implementation
- Server-side validation (security)

**Database Responsibilities (Neon PostgreSQL):**
- Data persistence
- Data integrity constraints
- Relational data storage
- Transaction management

### Section 2.4: Stateless Service Design

**Requirements:**
- Backend MUST NOT maintain session state
- All requests MUST be self-contained
- Authentication via JWT tokens ONLY
- No in-memory user sessions
- No sticky sessions required
- Horizontal scalability enabled

---

## Article III: Security Rules

### Section 3.1: Defense in Depth (MANDATORY)

**Security is implemented at EVERY layer:**

1. **Frontend Layer:**
   - Input validation for UX
   - XSS prevention (React automatic escaping)
   - CSRF tokens via Better Auth
   - Secure token storage (httpOnly cookies or secure storage)

2. **API Layer:**
   - JWT verification on ALL endpoints
   - User ID extraction and validation
   - Rate limiting (future)
   - HTTPS only (production)

3. **Application Layer:**
   - Business rule validation
   - User authorization checks
   - Data ownership verification

4. **Database Layer:**
   - Parameterized queries (SQLModel ORM)
   - Foreign key constraints
   - User ID on all tables
   - Row-level isolation

### Section 3.2: Zero Trust Architecture

**Principles:**
- NEVER trust client-provided data
- ALWAYS verify JWT tokens
- ALWAYS validate user ID matches token
- ALWAYS filter by authenticated user
- NEVER skip authentication
- NEVER trust URL parameters alone

**Example (FORBIDDEN):**
```python
# ❌ WRONG - Trusts user_id from URL
@app.get("/api/{user_id}/tasks")
def get_tasks(user_id: str):
    return repository.get_tasks(user_id)  # SECURITY HOLE!
```

**Example (REQUIRED):**
```python
# ✅ CORRECT - Verifies token and matches user_id
@app.get("/api/{user_id}/tasks")
def get_tasks(user_id: str, token_user: str = Depends(get_current_user)):
    if user_id != token_user:
        raise HTTPException(403, "Forbidden")
    return repository.get_tasks(user_id)
```

### Section 3.3: Input Validation Rules

**ALL input MUST be validated at multiple layers:**

1. **Presentation Layer (Frontend):**
   - Basic format checking
   - Length limits
   - Type validation
   - Immediate user feedback

2. **API Layer (Backend):**
   - Pydantic models for request validation
   - Type coercion and checking
   - Required field validation

3. **Domain Layer:**
   - Business rule validation
   - Entity constraints
   - Value object validation

**Example:**
```python
# Frontend: Basic validation
<input maxLength={200} required pattern=".*\S.*" />

# API Layer: Pydantic model
class CreateTaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)

# Domain Layer: Task entity validation
def _validate_title(title: str):
    if not title or not title.strip():
        raise TaskValidationError("Title is required")
    if len(title) > 200:
        raise TaskValidationError("Title too long")
```

### Section 3.4: SQL Injection Prevention

**Requirements:**
- NEVER use raw SQL with user input
- ALWAYS use SQLModel ORM
- ALWAYS use parameterized queries
- NEVER build SQL strings via concatenation

**Example (FORBIDDEN):**
```python
# ❌ FORBIDDEN - SQL Injection vulnerability
query = f"SELECT * FROM tasks WHERE user_id = '{user_id}'"
db.execute(query)
```

**Example (REQUIRED):**
```python
# ✅ REQUIRED - SQLModel ORM with parameters
tasks = session.exec(
    select(TaskModel).where(TaskModel.user_id == user_id)
).all()
```

### Section 3.5: Secrets Management

**Requirements:**
- NO secrets in code
- NO secrets in git
- ALL secrets via environment variables
- Different secrets per environment

**Required Environment Variables:**
```bash
# Backend
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<shared-secret>
JWT_ALGORITHM=HS256

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<shared-secret>
```

---

## Article IV: Spec-Driven Workflow Rules

### Section 4.1: Spec-Kit Plus for Phase II (MANDATORY)

**Extended Workflow:**
```
1. CONSTITUTION (WHY)
   - Read this document
   - Understand principles and constraints
   ↓
2. SPECIFY (WHAT)
   - Define requirements
   - Write user journeys
   - Set acceptance criteria
   ↓
3. PLAN (HOW)
   - Design API endpoints
   - Design database schema
   - Design component architecture
   - Map frontend-backend integration
   ↓
4. TASKS (BREAKDOWN)
   - Break into atomic tasks
   - Define dependencies
   - Link to specifications
   ↓
5. IMPLEMENT (CODE)
   - Generate backend code (FastAPI + Clean Arch)
   - Generate frontend code (Next.js)
   - Generate database models (SQLModel)
   - Generate API client
   ↓
6. VALIDATE (TEST)
   - Test authentication flow
   - Test data isolation
   - Test API endpoints
   - Test UI components
```

### Section 4.2: Specification Structure (MANDATORY)

**Required Specification Files:**
```
/specs/
├── overview.md              # Project overview and objectives
├── architecture.md          # System architecture and patterns
├── features/
│   ├── task-crud.md        # CRUD operations specification
│   ├── authentication.md    # Auth flow and security
│   └── user-isolation.md    # Multi-user data isolation rules
├── api/
│   └── rest-endpoints.md    # API endpoint specifications
├── database/
│   └── schema.md            # Database schema and models
└── ui/
    ├── components.md        # React component specifications
    └── pages.md             # Page/route specifications
```

### Section 4.3: Specification Quality Standards

**Each specification MUST include:**

1. **User Stories** (Functional perspective)
2. **Acceptance Criteria** (Testable conditions)
3. **Technical Requirements** (Implementation constraints)
4. **Data Models** (Structure and validation)
5. **Error Handling** (Failure scenarios)
6. **Security Considerations** (Threat mitigation)
7. **Examples** (Concrete scenarios)

### Section 4.4: Traceability Requirement

**EVERY line of code MUST trace back to:**
- A specification section
- A user story
- An acceptance criterion
- A technical requirement

**Enforcement:**
- Code reviews verify traceability
- Missing traceability = rejection
- Specifications updated before code

---

## Article V: No-Manual-Code Constraint

### Section 5.1: Zero Manual Coding Policy (ABSOLUTE)

**Rule:** NO code shall be manually written by humans.

**Process:**
1. Human writes detailed specifications
2. Claude Code generates ALL code from specs
3. Human reviews and tests generated code
4. If issues found, update specs and regenerate
5. NEVER manually edit generated code

### Section 5.2: Permitted Human Activities

**Humans MAY:**
- Write specifications
- Review generated code
- Test functionality
- Update specifications
- Provide feedback to AI
- Make architectural decisions
- Define acceptance criteria
- Approve or reject code

**Humans MAY NOT:**
- Write production code directly
- Edit generated code files
- Add "quick fixes" manually
- Skip specification updates
- Make code changes outside spec-gen flow

### Section 5.3: Exception Handling

**If code has bugs:**
```
1. Identify the issue
2. Determine root cause (spec ambiguity? AI error?)
3. Update specification to clarify
4. Regenerate code via Claude Code
5. Test again
6. Document in session history
```

**FORBIDDEN Shortcut:**
```
❌ "Let me just quickly fix this typo..."
❌ "I'll manually add this one line..."
❌ "The AI missed this, I'll add it..."
```

### Section 5.4: Verification and Audit

**Every commit MUST include:**
- Link to specification section
- Evidence of AI generation
- Human review approval
- Test results

**Session History:**
- All prompts logged in `/history/sessions/`
- All AI responses captured
- All generated code tracked
- Complete audit trail maintained

---

## Article VI: Multi-User Data Isolation

### Section 6.1: Data Isolation Principles (IMMUTABLE)

**Absolute Rule:** Users MUST NEVER see each other's data.

**Implementation Requirements:**

1. **Database Level:**
   - ALL data tables MUST have `user_id` foreign key
   - ALL queries MUST filter by `user_id`
   - NO cross-user queries permitted
   - Database constraints enforce ownership

2. **Application Level:**
   - Use cases MUST receive authenticated user ID
   - Use cases MUST filter by user ID
   - Repository methods MUST accept user ID parameter

3. **API Level:**
   - JWT token contains user ID
   - API extracts user ID from token
   - API passes user ID to use cases
   - URL user_id MUST match token user_id

### Section 6.2: User ID Propagation

**Flow:**
```
1. User authenticates → Better Auth issues JWT with user_id
2. Frontend stores JWT (cookie or localStorage)
3. Frontend makes API request with JWT in Authorization header
4. FastAPI middleware verifies JWT → extracts user_id
5. Route handler receives authenticated user_id
6. Route validates URL user_id matches token user_id
7. Use case receives user_id parameter
8. Repository filters all queries by user_id
9. Database returns only that user's data
```

### Section 6.3: Forbidden Patterns

**NEVER do this:**
```python
# ❌ WRONG - No user filtering
def get_all_tasks():
    return db.query(Task).all()  # Returns ALL users' tasks!

# ❌ WRONG - Trusts client input
def get_tasks(user_id: str):
    return db.query(Task).filter_by(user_id=user_id).all()
    # Client can pass any user_id!

# ❌ WRONG - No ownership check
def delete_task(task_id: int):
    task = db.query(Task).filter_by(id=task_id).first()
    db.delete(task)  # Can delete anyone's task!
```

**ALWAYS do this:**
```python
# ✅ CORRECT - Filters by authenticated user
def get_tasks(authenticated_user_id: str):
    return db.query(Task).filter_by(user_id=authenticated_user_id).all()

# ✅ CORRECT - Verifies ownership before deletion
def delete_task(task_id: int, authenticated_user_id: str):
    task = db.query(Task).filter_by(
        id=task_id,
        user_id=authenticated_user_id  # Ownership check
    ).first()
    if not task:
        raise TaskNotFoundError()
    db.delete(task)
```

### Section 6.4: Testing Data Isolation

**Required Tests:**

1. **Test: User A cannot see User B's tasks**
   ```python
   # Create task for user A
   # Authenticate as user B
   # Try to list tasks
   # Assert: User A's task NOT in list
   ```

2. **Test: User A cannot update User B's task**
   ```python
   # Create task for user B
   # Authenticate as user A
   # Try to update User B's task
   # Assert: 404 or 403 error
   ```

3. **Test: User A cannot delete User B's task**
   ```python
   # Create task for user B
   # Authenticate as user A
   # Try to delete User B's task
   # Assert: 404 or 403 error
   ```

4. **Test: URL manipulation doesn't break isolation**
   ```python
   # Authenticate as user A
   # Try GET /api/user_B/tasks with user A's token
   # Assert: 403 Forbidden
   ```

---

## Article VII: JWT Trust Boundaries

### Section 7.1: JWT Architecture

**JWT Flow:**
```
┌─────────────┐                    ┌──────────────┐
│   Browser   │                    │  Better Auth │
│  (Next.js)  │                    │  (Next.js)   │
└──────┬──────┘                    └──────┬───────┘
       │                                  │
       │ 1. Login request                 │
       ├─────────────────────────────────▶│
       │                                  │ 2. Verify credentials
       │                                  │ 3. Generate JWT
       │                                  │    {user_id, email, exp}
       │ 4. JWT token                     │
       │◀─────────────────────────────────┤
       │                                  │
       │ 5. Store JWT (cookie/storage)    │
       │                                  │
       │ 6. API request + JWT in header   │
       ├─────────────────────────────────────────────▶
       │                                  ┌──────────────────┐
       │                                  │ FastAPI Backend  │
       │                                  │ 7. Extract JWT   │
       │                                  │ 8. Verify sig    │
       │                                  │ 9. Check exp     │
       │                                  │ 10. Extract user │
       │                                  └──────────────────┘
```

### Section 7.2: Shared Secret Requirement

**Critical Constraint:**
- Frontend (Better Auth) and Backend (FastAPI) MUST share same secret
- Secret used for JWT signing and verification
- Secret MUST be strong (min 32 characters)
- Secret MUST be kept confidential
- Secret MUST be same value in both .env files

**Configuration:**
```bash
# frontend/.env.local
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars

# backend/.env
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
JWT_ALGORITHM=HS256
```

### Section 7.3: JWT Verification (MANDATORY)

**Backend MUST verify EVERY request:**

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract and verify JWT token, return user ID."""
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")  # or "userId" depending on Better Auth config
        if not user_id:
            raise HTTPException(401, "Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
```

**Usage in routes:**
```python
@app.get("/api/{user_id}/tasks")
def get_tasks(
    user_id: str,
    authenticated_user: str = Depends(get_current_user)
):
    # Verify URL user_id matches token user_id
    if user_id != authenticated_user:
        raise HTTPException(403, "Forbidden")

    # Now safe to proceed
    return use_case.execute(authenticated_user)
```

### Section 7.4: Token Expiration

**Requirements:**
- JWTs MUST have expiration time
- Recommended: 7 days
- Frontend MUST handle token refresh
- Backend MUST reject expired tokens
- No "remember me forever" tokens

### Section 7.5: Trust Boundary Diagram

```
┌─────────────────────────────────────────────────────────┐
│                 UNTRUSTED ZONE                           │
│  (Client-side, Browser, User's Device)                   │
│                                                           │
│  - User can modify any data here                         │
│  - Never trust client-provided data                      │
│  - JWT can be stolen from localStorage                   │
│                                                           │
└────────────────────┬────────────────────────────────────┘
                     │
           ┌─────────▼──────────┐
           │    HTTPS + JWT     │  ◀── Trust Boundary
           │  Authorization:    │
           │  Bearer <token>    │
           └─────────┬──────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 TRUSTED ZONE                             │
│  (Server-side, Backend, Database)                        │
│                                                           │
│  1. Verify JWT signature                                 │
│  2. Check token expiration                               │
│  3. Extract user_id                                      │
│  4. Validate user_id matches URL                         │
│  5. Execute business logic                               │
│  6. Filter data by verified user_id                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Article VIII: Technology Stack Constraints

### Section 8.1: Mandatory Stack (IMMUTABLE)

**The following technology choices are ABSOLUTE:**

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend Framework | Next.js | 16+ | App Router, React Server Components, production-ready |
| Frontend Runtime | React | 19+ | Industry standard, component-based |
| Frontend Styling | Tailwind CSS | Latest | Utility-first, rapid development |
| Backend Framework | FastAPI | Latest | Python, async, OpenAPI, fast |
| Backend Language | Python | 3.13+ | Consistency with Phase I |
| ORM | SQLModel | Latest | Pydantic integration, type-safe |
| Database | Neon Serverless PostgreSQL | Latest | Managed, scalable, free tier |
| Authentication | Better Auth | Latest | Next.js native, modern |
| API Standard | REST | - | HTTP/JSON, standard RESTful principles |
| Spec System | Spec-Kit Plus | - | Phase I methodology |

### Section 8.2: Forbidden Alternatives

**DO NOT use these alternatives:**

- ❌ Vue.js, Angular (use Next.js)
- ❌ Django, Flask (use FastAPI)
- ❌ TypeORM, Prisma (use SQLModel)
- ❌ MongoDB, Firebase (use PostgreSQL)
- ❌ NextAuth, Auth0, Clerk (use Better Auth)
- ❌ GraphQL (use REST)
- ❌ Pages Router (use App Router)

### Section 8.3: Dependency Management

**Frontend:**
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "better-auth": "latest",
    "tailwindcss": "latest"
  }
}
```

**Backend:**
```toml
[project]
dependencies = [
    "fastapi",
    "sqlmodel",
    "pyjwt",
    "python-multipart",
    "uvicorn",
]
```

---

## Article IX: API Design Principles

### Section 9.1: RESTful API Standards (MANDATORY)

**All API endpoints MUST follow REST principles:**

1. **Resource-Based URLs**
   - Use nouns, not verbs
   - Plural resource names
   - Hierarchical structure

2. **HTTP Methods**
   - GET: Retrieve resource(s)
   - POST: Create new resource
   - PUT: Update entire resource
   - PATCH: Partial update
   - DELETE: Remove resource

3. **Status Codes**
   - 200: Success
   - 201: Created
   - 204: No Content (successful deletion)
   - 400: Bad Request (validation error)
   - 401: Unauthorized (no token or invalid token)
   - 403: Forbidden (valid token but insufficient permissions)
   - 404: Not Found
   - 500: Internal Server Error

### Section 9.2: Endpoint Specification

**Required Endpoints:**

```
GET    /api/{user_id}/tasks              # List all tasks for user
POST   /api/{user_id}/tasks              # Create new task
GET    /api/{user_id}/tasks/{id}         # Get task details
PUT    /api/{user_id}/tasks/{id}         # Update task (full)
DELETE /api/{user_id}/tasks/{id}         # Delete task
PATCH  /api/{user_id}/tasks/{id}/complete  # Toggle completion
```

**Endpoint Pattern:**
```
/api/{user_id}/{resource}/{id?}/{action?}
```

### Section 9.3: Request/Response Format

**All requests/responses MUST be JSON.**

**Request Body Example (POST /api/{user_id}/tasks):**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response Body Example (200 OK):**
```json
{
  "id": 1,
  "user_id": "user_abc123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-03T10:00:00Z",
  "updated_at": "2026-01-03T10:00:00Z"
}
```

**Error Response Example (400 Bad Request):**
```json
{
  "error": "Validation Error",
  "message": "Title is required",
  "field": "title"
}
```

### Section 9.4: Pydantic Models

**ALL API requests and responses MUST use Pydantic models:**

```python
from pydantic import BaseModel, Field
from datetime import datetime

class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)

class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

class ErrorResponse(BaseModel):
    error: str
    message: str
    field: str = None
```

---

## Article X: Frontend Architecture

### Section 10.1: Next.js App Router Structure

**Required Structure:**
```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── dashboard/
│   │   └── page.tsx            # Task dashboard (protected)
│   └── api/
│       └── auth/
│           └── [...all].ts     # Better Auth API routes
├── components/
│   ├── TaskList.tsx            # Task list component
│   ├── TaskItem.tsx            # Individual task component
│   ├── TaskForm.tsx            # Create/edit task form
│   └── Header.tsx              # App header with logout
├── lib/
│   ├── api.ts                  # API client for backend
│   ├── auth.ts                 # Better Auth configuration
│   └── types.ts                # TypeScript types
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

### Section 10.2: Component Principles

**ALL components MUST follow:**

1. **Server Components by Default**
   - Use React Server Components unless interactivity needed
   - Mark client components with `"use client"`

2. **Single Responsibility**
   - Each component does one thing
   - No God components

3. **Props Typing**
   - ALL props must be typed (TypeScript)
   - No `any` types

4. **Error Boundaries**
   - Wrap components in error boundaries
   - Graceful error handling

### Section 10.3: State Management

**Requirements:**
- Use React hooks (useState, useEffect) for local state
- Use React Context for global state (auth user)
- No Redux or Zustand (YAGNI for Phase II)
- Server state via React Query (optional)

### Section 10.4: API Client

**Centralized API client (`lib/api.ts`):**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken(); // Get JWT from cookie/storage

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getTasks: (userId: string) =>
    fetchAPI(`/api/${userId}/tasks`),

  createTask: (userId: string, data: { title: string; description?: string }) =>
    fetchAPI(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ... other methods
};
```

---

## Article XI: Backend Architecture

### Section 11.1: FastAPI Project Structure

**Required Structure:**
```
backend/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration and environment variables
│   ├── database.py             # Database connection setup
│   ├── auth.py                 # JWT verification middleware
│   │
│   ├── domain/                 # Domain Layer (FROM PHASE I)
│   │   ├── entities/
│   │   │   └── task.py        # ❌ MUST NOT CHANGE
│   │   ├── value_objects/
│   │   │   └── task_status.py # ❌ MUST NOT CHANGE
│   │   └── exceptions.py       # ❌ MUST NOT CHANGE
│   │
│   ├── application/            # Application Layer (FROM PHASE I)
│   │   ├── interfaces/
│   │   │   └── task_repository.py  # ❌ MUST NOT CHANGE
│   │   └── use_cases/
│   │       ├── add_task.py     # ❌ MUST NOT CHANGE
│   │       ├── list_tasks.py   # ❌ MUST NOT CHANGE
│   │       ├── update_task.py  # ❌ MUST NOT CHANGE
│   │       ├── delete_task.py  # ❌ MUST NOT CHANGE
│   │       ├── complete_task.py    # ❌ MUST NOT CHANGE
│   │       └── uncomplete_task.py  # ❌ MUST NOT CHANGE
│   │
│   ├── infrastructure/         # Infrastructure Layer (NEW for Phase II)
│   │   ├── models.py          # SQLModel database models
│   │   └── repositories/
│   │       └── postgresql_task_repository.py  # ✅ NEW
│   │
│   └── presentation/           # Presentation Layer (NEW for Phase II)
│       ├── routes/
│       │   └── tasks.py       # FastAPI route handlers
│       ├── schemas.py         # Pydantic request/response models
│       └── dependencies.py    # FastAPI dependencies (auth, db)
│
├── migrations/                 # Database migrations (optional)
├── tests/
├── .env                        # Environment variables
├── pyproject.toml              # UV dependencies
└── README.md
```

### Section 11.2: Database Models vs Domain Entities

**Critical Separation:**

```python
# infrastructure/models.py (SQLModel - Database representation)
from sqlmodel import SQLModel, Field
from datetime import datetime

class TaskModel(SQLModel, table=True):
    """Database model for tasks (ORM)."""
    __tablename__ = "tasks"

    id: int = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str = Field(default="", max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# domain/entities/task.py (Domain Entity - Business logic)
class Task:
    """Domain entity (UNCHANGED FROM PHASE I)."""
    # ... existing Phase I implementation
```

**Mapping Between Layers:**

```python
# infrastructure/repositories/postgresql_task_repository.py

from application.interfaces.task_repository import TaskRepository
from domain.entities.task import Task
from infrastructure.models import TaskModel

class PostgreSQLTaskRepository(TaskRepository):
    """PostgreSQL implementation of TaskRepository."""

    def add(self, task: Task, user_id: str) -> Task:
        """Map Domain Entity → Database Model → Save → Map back."""
        db_task = TaskModel(
            id=task.id,
            user_id=user_id,
            title=task.title,
            description=task.description,
            completed=(task.status == TaskStatus.COMPLETED),
        )
        session.add(db_task)
        session.commit()
        session.refresh(db_task)

        # Map back to Domain Entity
        return self._to_domain_entity(db_task)

    def _to_domain_entity(self, db_task: TaskModel) -> Task:
        """Convert database model to domain entity."""
        return Task(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            status=TaskStatus.COMPLETED if db_task.completed else TaskStatus.PENDING,
            created_at=db_task.created_at,
        )
```

### Section 11.3: Dependency Injection in FastAPI

**Use FastAPI's dependency injection:**

```python
from fastapi import Depends
from sqlmodel import Session

# Database dependency
def get_db() -> Session:
    """Get database session."""
    with Session(engine) as session:
        yield session

# Auth dependency
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Get authenticated user ID from JWT."""
    # ... JWT verification logic
    return user_id

# Repository dependency
def get_repository(db: Session = Depends(get_db)) -> TaskRepository:
    """Get repository instance."""
    return PostgreSQLTaskRepository(db)

# Use case dependency
def get_add_task_use_case(
    repo: TaskRepository = Depends(get_repository)
) -> AddTaskUseCase:
    """Get use case instance."""
    return AddTaskUseCase(repo)

# Route using dependencies
@app.post("/api/{user_id}/tasks")
def create_task(
    user_id: str,
    request: TaskCreateRequest,
    authenticated_user: str = Depends(get_current_user),
    use_case: AddTaskUseCase = Depends(get_add_task_use_case),
):
    if user_id != authenticated_user:
        raise HTTPException(403, "Forbidden")

    task = use_case.execute(
        title=request.title,
        description=request.description,
        user_id=authenticated_user
    )
    return TaskResponse(...)
```

---

## Article XII: Database Design

### Section 12.1: Schema Requirements

**Required Tables:**

**users (managed by Better Auth):**
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**tasks:**
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) DEFAULT '',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

### Section 12.2: SQLModel Implementation

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    """User model (managed by Better Auth)."""
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationship
    tasks: list["TaskModel"] = Relationship(back_populates="user")


class TaskModel(SQLModel, table=True):
    """Task model for database."""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str = Field(default="", max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationship
    user: Optional[User] = Relationship(back_populates="tasks")
```

### Section 12.3: Connection Management

```python
from sqlmodel import create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    """Get database session."""
    with Session(engine) as session:
        yield session
```

### Section 12.4: Migrations

**Strategy:**
- Use SQLModel's `SQLModel.metadata.create_all(engine)` for Phase II
- Future: Alembic for production migrations
- NEVER manually modify database schema

---

## Article XIII: Authentication and Authorization

### Section 13.1: Better Auth Setup

**Frontend Configuration (`lib/auth.ts`):**
```typescript
import { BetterAuth } from "better-auth/client";

export const auth = BetterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    // Enable JWT plugin
    {
      id: "jwt",
      hooks: {
        after: [
          {
            matcher: () => true,
            handler: async (ctx) => {
              // Store JWT in localStorage or cookie
            },
          },
        ],
      },
    },
  ],
});
```

**Backend JWT Configuration:**
```python
import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

def verify_token(token: str) -> dict:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
```

### Section 13.2: Protected Routes

**Frontend:**
```typescript
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return <TaskDashboard userId={session.user.id} />;
}
```

**Backend:**
```python
from fastapi import Depends

@app.get("/api/{user_id}/tasks")
def get_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user)  # ← Protected
):
    if user_id != current_user:
        raise HTTPException(403)
    # ...
```

### Section 13.3: Authorization Rules

**Rule Matrix:**

| User | Can View Own Tasks | Can Edit Own Tasks | Can Delete Own Tasks | Can View Others' Tasks | Can Edit Others' Tasks |
|------|-------------------|-------------------|---------------------|----------------------|----------------------|
| Authenticated User | ✅ YES | ✅ YES | ✅ YES | ❌ NO | ❌ NO |
| Unauthenticated | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO |

**Implementation:**
- User can ONLY access `/api/{their_user_id}/...`
- Attempting `/api/{other_user_id}/...` returns 403 Forbidden
- No admin users in Phase II (future)

---

## Article XIV: Monorepo Organization

### Section 14.1: Repository Structure (MANDATORY)

```
todo-app-phase2/
├── .spec-kit/
│   └── config.yaml                  # Spec-Kit Plus configuration
│
├── specs/                           # All specifications
│   ├── overview.md
│   ├── architecture.md
│   ├── features/
│   │   ├── task-crud.md
│   │   ├── authentication.md
│   │   └── user-isolation.md
│   ├── api/
│   │   └── rest-endpoints.md
│   ├── database/
│   │   └── schema.md
│   └── ui/
│       ├── components.md
│       └── pages.md
│
├── frontend/                        # Next.js application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── .env.local
│   ├── CLAUDE.md                    # Frontend-specific instructions
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                         # FastAPI application
│   ├── app/
│   │   ├── domain/                  # ← FROM PHASE I (UNCHANGED)
│   │   ├── application/             # ← FROM PHASE I (UNCHANGED)
│   │   ├── infrastructure/          # ← NEW for Phase II
│   │   ├── presentation/            # ← NEW for Phase II (REST API)
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── auth.py
│   ├── tests/
│   ├── .env
│   ├── CLAUDE.md                    # Backend-specific instructions
│   ├── pyproject.toml
│   └── README.md
│
├── history/                         # Session tracking
│   ├── README.md
│   └── sessions/
│       ├── session-001-2026-01-03.md
│       └── ...
│
├── .gitignore
├── CONSTITUTION_PHASE2.md           # This document
├── CLAUDE.md                        # Root instructions
├── ROLE_AND_AUTHORITY.md
└── README.md
```

### Section 14.2: Workspace Configuration

**Root `package.json` (if using npm workspaces):**
```json
{
  "name": "todo-app-monorepo",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ]
}
```

### Section 14.3: CLAUDE.md Files

**Root CLAUDE.md:**
- Points to Phase II Constitution
- Explains monorepo structure
- References frontend and backend CLAUDE.md files

**Frontend CLAUDE.md:**
- Next.js-specific conventions
- Component patterns
- API client usage
- Better Auth integration

**Backend CLAUDE.md:**
- FastAPI conventions
- Clean Architecture layer rules
- Repository implementation
- JWT verification

---

## Article XV: Development Workflow

### Section 15.1: Phase II Development Cycle

```
┌─────────────────────────────────────────────────────────┐
│ 1. READ CONSTITUTION (This Document)                    │
│    - Understand principles and constraints              │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ 2. WRITE SPECIFICATIONS                                 │
│    - Define feature in /specs/features/                 │
│    - Define API in /specs/api/                          │
│    - Define DB schema in /specs/database/               │
│    - Define UI in /specs/ui/                            │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ 3. GENERATE PLAN (Claude Code)                          │
│    - Architectural approach                             │
│    - Component breakdown                                │
│    - Integration points                                 │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ 4. CREATE TASKS                                          │
│    - Break plan into atomic tasks                       │
│    - Define dependencies                                │
│    - Link to specifications                             │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ 5. IMPLEMENT (Claude Code)                              │
│    - Generate backend code                              │
│    - Generate frontend code                             │
│    - Generate database models                           │
│    - Generate API client                                │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│ 6. REVIEW & TEST (Human)                                │
│    - Review generated code                              │
│    - Test authentication flow                           │
│    - Test data isolation                                │
│    - Test API endpoints                                 │
│    - Test UI functionality                              │
└────────────────────────┬────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │ Issues? │
                    └────┬────┘
                      Yes│  │No
                         │  │
         Update Specs ◀──┘  └──▶ Commit & Deploy
```

### Section 15.2: Daily Development Routine

**Morning:**
1. Review session history
2. Check Constitution compliance
3. Update specifications as needed
4. Plan day's tasks

**Development:**
1. Write/update specification
2. Generate code via Claude Code
3. Review generated code
4. Test functionality
5. Update session history

**Evening:**
1. Commit changes with proper messages
2. Update session history
3. Document any issues or decisions
4. Plan next day's work

---

## Article XVI: Testing Requirements

### Section 16.1: Testing Strategy

**Test Pyramid for Phase II:**
```
         /\
        /E2E\       ← Full user flows (10%)
       /────\
      /Integr\      ← API + DB integration (30%)
     /────────\
    /   Unit   \    ← Business logic, components (60%)
   /____________\
```

### Section 16.2: Backend Testing

**Unit Tests (Domain & Application):**
```python
# tests/unit/domain/test_task_entity.py
def test_task_complete():
    task = Task(id=1, title="Test")
    task.complete()
    assert task.status == TaskStatus.COMPLETED

# tests/unit/application/test_add_task_use_case.py
def test_add_task_creates_task(mock_repository):
    use_case = AddTaskUseCase(mock_repository)
    task = use_case.execute("Test Task", user_id="user_123")
    assert task.title == "Test Task"
    mock_repository.add.assert_called_once()
```

**Integration Tests (API + DB):**
```python
# tests/integration/test_tasks_api.py
def test_create_task_requires_auth(client):
    response = client.post("/api/user_123/tasks", json={"title": "Test"})
    assert response.status_code == 401

def test_user_cannot_access_other_users_tasks(client, auth_tokens):
    user_a_token = auth_tokens["user_a"]
    response = client.get(
        "/api/user_b/tasks",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )
    assert response.status_code == 403
```

### Section 16.3: Frontend Testing

**Component Tests:**
```typescript
// __tests__/components/TaskList.test.tsx
describe('TaskList', () => {
  it('renders tasks', () => {
    const tasks = [{ id: 1, title: 'Test Task', completed: false }];
    render(<TaskList tasks={tasks} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

**E2E Tests (Playwright/Cypress):**
```typescript
test('user can create and complete task', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await page.goto('/dashboard');
  await page.fill('[name="title"]', 'New Task');
  await page.click('button:text("Add")');

  await expect(page.locator('text=New Task')).toBeVisible();

  await page.click('[data-task-id="1"] button:text("Complete")');
  await expect(page.locator('[data-task-id="1"]')).toHaveClass(/completed/);
});
```

### Section 16.4: Security Testing

**Required Security Tests:**

1. **Test: JWT verification works**
2. **Test: Expired tokens are rejected**
3. **Test: Invalid tokens are rejected**
4. **Test: User ID mismatch returns 403**
5. **Test: SQL injection prevented** (parameterized queries)
6. **Test: XSS prevented** (React escaping)
7. **Test: CSRF protection active** (Better Auth)

---

## Article XVII: Deployment Standards

### Section 17.1: Deployment Targets

**Phase II Deployment:**

1. **Frontend:**
   - Platform: Vercel (recommended)
   - Alternative: Netlify, AWS Amplify
   - URL: `https://todo-app-[username].vercel.app`

2. **Backend:**
   - Platform: Vercel (serverless)
   - Alternative: Railway, Render
   - URL: `https://todo-api-[username].vercel.app`

3. **Database:**
   - Platform: Neon Serverless PostgreSQL
   - Region: Auto (nearest)
   - Free tier: ✅ Enabled

### Section 17.2: Environment Configuration

**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=https://todo-api-username.vercel.app
BETTER_AUTH_SECRET=<your-secret>
BETTER_AUTH_URL=https://todo-app-username.vercel.app
```

**Backend `.env`:**
```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=<same-as-frontend>
JWT_ALGORITHM=HS256
CORS_ORIGINS=https://todo-app-username.vercel.app
```

### Section 17.3: Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Database migrations applied
- [ ] Secrets are secure (not in git)
- [ ] API endpoints tested
- [ ] Authentication flow tested
- [ ] Data isolation verified

**Post-Deployment:**
- [ ] Frontend accessible
- [ ] Backend API accessible
- [ ] Database connection works
- [ ] Authentication works
- [ ] CRUD operations work
- [ ] Error handling works
- [ ] No console errors
- [ ] Performance acceptable

---

## Article XVIII: Amendment Process

### Section 18.1: Amendment Authority

This Constitution may be amended by:
1. Project maintainer(s)
2. Justified technical necessity
3. Hackathon requirement changes

### Section 18.2: Non-Amendable Provisions (IMMUTABLE)

The following CANNOT be changed:

1. **Clean Architecture Requirement** (Article II)
2. **Zero Manual Coding** (Article V)
3. **Multi-User Data Isolation** (Article VI)
4. **JWT Trust Boundaries** (Article VII)
5. **Technology Stack** (Article VIII)
6. **Spec-Driven Workflow** (Article IV)

### Section 18.3: Amendment Procedure

1. Identify need for amendment
2. Document rationale
3. Update Constitution
4. Update specifications
5. Regenerate affected code
6. Test thoroughly
7. Document in session history

---

## Appendix A: Phase I to Phase II Migration

### Section A.1: What Changed

**Unchanged (Validation of Clean Architecture):**
```
✅ domain/entities/task.py           IDENTICAL
✅ domain/value_objects/task_status.py  IDENTICAL
✅ domain/exceptions.py               IDENTICAL
✅ application/interfaces/task_repository.py  IDENTICAL
✅ application/use_cases/*.py         IDENTICAL (except user_id param)
```

**New/Changed:**
```
🆕 infrastructure/repositories/postgresql_task_repository.py  NEW
🆕 infrastructure/models.py           NEW (SQLModel)
🆕 presentation/routes/*.py           NEW (FastAPI)
🆕 frontend/ (entire directory)        NEW (Next.js)
```

### Section A.2: Use Case Modification

**Minor Change Required (Add user_id parameter):**

```python
# Phase I: No user_id needed
class AddTaskUseCase:
    def execute(self, title: str, description: str = "") -> Task:
        # ...

# Phase II: Add user_id parameter
class AddTaskUseCase:
    def execute(self, title: str, description: str = "", user_id: str = None) -> Task:
        # Pass user_id to repository
        # ...
```

**Rationale:** Multi-user support requires knowing which user owns the task.

---

## Appendix B: Glossary

**Better Auth:** Modern authentication library for Next.js with JWT support

**Clean Architecture:** Architectural pattern with strict layer separation and dependency rules

**Dependency Injection:** Pattern where dependencies are passed to constructors

**FastAPI:** Modern Python web framework with automatic OpenAPI documentation

**JWT (JSON Web Token):** Stateless authentication token containing encoded user information

**Neon:** Serverless PostgreSQL database platform with free tier

**Next.js App Router:** Latest Next.js routing system with server components

**REST API:** Architectural style for web APIs using HTTP methods and resource URLs

**SQLModel:** Python library combining SQLAlchemy and Pydantic for type-safe ORM

**Spec-Kit Plus:** Specification-driven development methodology with AI assistance

**Trust Boundary:** Line between trusted (server) and untrusted (client) code

**User Isolation:** Architectural constraint ensuring users cannot access each other's data

---

## Appendix C: Decision Records

### DR-P2-001: Next.js App Router over Pages Router
**Date:** 2026-01-03
**Decision:** Use Next.js App Router instead of Pages Router
**Rationale:** Modern approach, server components, better performance
**Status:** Approved - IMMUTABLE

### DR-P2-002: Better Auth over NextAuth
**Date:** 2026-01-03
**Decision:** Use Better Auth for authentication
**Rationale:** Modern, JWT-native, better TypeScript support
**Status:** Approved - IMMUTABLE

### DR-P2-003: SQLModel over SQLAlchemy
**Date:** 2026-01-03
**Decision:** Use SQLModel as ORM
**Rationale:** Pydantic integration, type safety, modern approach
**Status:** Approved - IMMUTABLE

### DR-P2-004: Neon over Self-Hosted PostgreSQL
**Date:** 2026-01-03
**Decision:** Use Neon Serverless PostgreSQL
**Rationale:** Free tier, managed, scalable, no ops overhead
**Status:** Approved - IMMUTABLE

### DR-P2-005: Monorepo Structure
**Date:** 2026-01-03
**Decision:** Use monorepo with /frontend and /backend
**Rationale:** Easier management, shared specs, single repo
**Status:** Approved

### DR-P2-006: REST over GraphQL
**Date:** 2026-01-03
**Decision:** Use REST API instead of GraphQL
**Rationale:** Simpler for Phase II, better understood, adequate for use case
**Status:** Approved - IMMUTABLE

### DR-P2-007: User ID in Use Cases
**Date:** 2026-01-03
**Decision:** Add user_id parameter to use case execute() methods
**Rationale:** Multi-user support requires ownership tracking
**Status:** Approved

---

## Constitution Ratification

This Constitution is hereby adopted and ratified as the supreme governance document for Todo Application Phase II.

**Effective Date:** January 3, 2026
**Version:** 2.0
**Authority:** Project Architect
**Extends:** Phase I Constitution v1.0

**Signature Block:**
```
_________________________
Claude Code (AI Architect)
Software Architect & Governance Engineer

Date: January 3, 2026
```

---

## End of Constitution - Phase II

**Final Note:** This Constitution serves as the authoritative guide for Phase II full-stack web application development. All participants—human architects, developers, and AI assistants—MUST adhere to the principles and rules set forth herein.

**When in doubt, consult:**
1. This Constitution (Phase II)
2. Phase I Constitution (for inherited principles)
3. Specifications in /specs/
4. Session history in /history/

**Questions or Clarifications:** Document in session history and update specifications accordingly.

**Long Live Clean Architecture!** 🏛️
**Welcome to Phase II: The Web Era!** 🌐

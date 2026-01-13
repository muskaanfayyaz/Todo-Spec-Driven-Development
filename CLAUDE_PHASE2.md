# Claude Code Development Documentation - Phase II

**Project:** Todo App - Phase II: Full-Stack Web Application
**Development Approach:** AI-Assisted Specification-Driven Development
**AI Tool:** Claude Code (Anthropic)
**Methodology:** Spec-Kit Plus
**Date:** January 4, 2026

---

## Phase II Context

This is the **Phase II** evolution of the Todo CLI application. Phase I was a console-based in-memory application. Phase II transforms it into a production-ready, multi-user, full-stack web application.

**Phase I (Completed):**
- Console application with REPL loop
- In-memory task storage
- Clean Architecture (Domain + Application layers)
- Single-user, local execution
- See: `/src/` and `/CLAUDE.md`

**Phase II (Current):**
- Full-stack web application
- Next.js frontend + FastAPI backend
- PostgreSQL persistent storage (Neon)
- Multi-user with JWT authentication
- REST API architecture
- See: `/frontend/`, `/backend/`, and this document

---

## Monorepo Structure

```
todo-app-phase2/
├── frontend/              # Next.js App Router application
│   ├── CLAUDE.md         # ← Frontend-specific guidance
│   └── ...
├── backend/              # FastAPI application
│   ├── CLAUDE.md         # ← Backend-specific guidance
│   └── app/
│       ├── domain/       # ← FROM PHASE I (UNCHANGED)
│       ├── application/  # ← FROM PHASE I (UNCHANGED)
│       ├── infrastructure/  # ← NEW for Phase II
│       └── presentation/    # ← NEW for Phase II
├── specs/                # All specifications
├── src/                  # Phase I code (reference only)
├── CONSTITUTION_PHASE2.md  # Supreme governance
└── CLAUDE_PHASE2.md      # ← This document
```

---

## Spec-Kit Plus Methodology

**Phase II follows the same zero-manual-coding approach as Phase I.**

### Development Flow

1. **Human writes specifications** in `/specs/`
2. **Claude Code reads specs** and generates code
3. **Code is generated for frontend and backend** separately
4. **Human reviews and tests** generated code
5. **Iterate on specs**, not code

### Key Principles

1. **100% Spec-Driven**: All code generated from specifications
2. **No Manual Coding**: Humans write specs, AI writes code
3. **Clean Architecture**: Phase I domain/application layers preserved
4. **Multi-Service**: Frontend and backend are independent services
5. **Security First**: Multi-user isolation enforced at every layer

---

## Working with Claude Code

### For Frontend Development

**Read:** `/frontend/CLAUDE.md`

Key points:
- Next.js 14+ with App Router
- Tailwind CSS for styling
- Better Auth for authentication
- API client for backend communication
- All code generated from `/specs/ui/`

**Start here:**
```bash
cd frontend
# Read frontend/CLAUDE.md for detailed instructions
```

### For Backend Development

**Read:** `/backend/CLAUDE.md`

Key points:
- FastAPI with Clean Architecture
- SQLModel + PostgreSQL (Neon)
- JWT token verification
- Phase I domain/application layers UNCHANGED
- All code generated from `/specs/api/` and `/specs/database/`

**Start here:**
```bash
cd backend
# Read backend/CLAUDE.md for detailed instructions
```

---

## Phase I to Phase II Migration

### What Stayed the Same

**Domain Layer** (`backend/app/domain/`):
- `Task` entity with validation
- `TaskStatus` value object
- Domain exceptions
- **100% unchanged from Phase I**

**Application Layer** (`backend/app/application/`):
- `AddTaskUseCase`
- `ListTasksUseCase`
- `UpdateTaskUseCase`
- `DeleteTaskUseCase`
- `CompleteTaskUseCase`
- `UncompleteTaskUseCase`
- **100% unchanged from Phase I**

### What Changed

**Infrastructure Layer** (NEW):
- `InMemoryTaskRepository` → `PostgreSQLTaskRepository`
- Database connection management
- User-scoped repository pattern

**Presentation Layer** (NEW):
- CLI REPL → FastAPI REST API
- Console I/O → HTTP requests/responses
- Implicit user → Explicit JWT authentication

**New Components**:
- Frontend (Next.js)
- Authentication (Better Auth + JWT)
- Multi-user support
- Persistent storage (Neon PostgreSQL)

---

## Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js)                          │
│  - React components                                      │
│  - Better Auth client                                    │
│  - API client (fetch with JWT)                          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS + JWT
                     ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI)                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Presentation Layer (REST API)                   │    │
│  │  - JWT verification                             │    │
│  │  - Request/response handling                    │    │
│  └────────────────┬────────────────────────────────┘    │
│                   │                                      │
│  ┌────────────────▼────────────────────────────────┐    │
│  │ Application Layer (Use Cases)                   │    │
│  │  - Business logic orchestration                 │    │
│  │  - FROM PHASE I - UNCHANGED                     │    │
│  └────────────────┬────────────────────────────────┘    │
│                   │                                      │
│  ┌────────────────▼────────────────────────────────┐    │
│  │ Domain Layer (Entities)                         │    │
│  │  - Business rules                               │    │
│  │  - FROM PHASE I - UNCHANGED                     │    │
│  └────────────────┬────────────────────────────────┘    │
│                   ▲                                      │
│  ┌────────────────┴────────────────────────────────┐    │
│  │ Infrastructure Layer (Repositories)             │    │
│  │  - PostgreSQL repository                        │    │
│  │  - User-scoped queries                          │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │ SQL
                     ▼
┌─────────────────────────────────────────────────────────┐
│          DATABASE (Neon PostgreSQL)                      │
│  - users table (Better Auth)                             │
│  - tasks table (user_id foreign key)                     │
└─────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Multi-User Isolation (CRITICAL)

**Every layer enforces isolation:**

1. **Frontend**: Only displays current user's data
2. **API**: Validates JWT and user_id parameter match
3. **Use Cases**: Receive authenticated user_id
4. **Repository**: ALL queries filter by user_id
5. **Database**: Foreign key constraints

**Defense in Depth**: If one layer fails, others still protect data.

### JWT Flow

```
1. User logs in → Better Auth generates JWT
2. Frontend stores JWT (httpOnly cookie)
3. Frontend includes JWT in every API request
4. Backend verifies JWT signature
5. Backend extracts user_id from JWT
6. Backend validates URL user_id == JWT user_id
7. Backend creates user-scoped repository
8. Repository queries filter by user_id
9. Only user's data returned
```

---

## Development Phases

### Phase II Chunks (Planned)

**Chunk 1: Scaffolding** ✅ (Current)
- Monorepo structure
- Frontend skeleton (Next.js)
- Backend skeleton (FastAPI)
- Configuration files

**Chunk 2: Database Layer** (Next)
- PostgreSQL models
- Migrations
- PostgreSQLTaskRepository

**Chunk 3: Backend API** (Next)
- REST endpoints
- JWT verification
- User-scoped operations

**Chunk 4: Frontend UI** (Next)
- Authentication pages
- Task list page
- Task operations

**Chunk 5: Integration** (Next)
- End-to-end testing
- Deployment preparation

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **PostgreSQL** (or Neon account)
- **Claude Code** (this tool)

### Setup

1. **Read the Constitution:**
   ```bash
   cat CONSTITUTION_PHASE2.md
   ```

2. **Review Specifications:**
   ```bash
   ls -la specs/
   ```

3. **Choose Frontend or Backend:**
   - Frontend: `cd frontend && cat CLAUDE.md`
   - Backend: `cd backend && cat CLAUDE.md`

4. **Install Dependencies:**
   ```bash
   # Frontend
   cd frontend && npm install

   # Backend
   cd backend && pip install -e .
   ```

5. **Configure Environment:**
   ```bash
   # Frontend
   cp frontend/.env.local.example frontend/.env.local

   # Backend
   cp backend/.env.example backend/.env
   ```

6. **Run Development Servers:**
   ```bash
   # Frontend (Terminal 1)
   cd frontend && npm run dev

   # Backend (Terminal 2)
   cd backend && python -m app.main
   ```

---

## Governance

**Supreme Authority:** `/CONSTITUTION_PHASE2.md`

**Article V - No Manual Code Constraint:**
> NO code shall be manually written by humans. All code generated by Claude Code from specifications.

**Article XIV - Monorepo Organization:**
> Repository structure is MANDATORY and must be followed exactly.

**Enforcement:**
- All commits must link to specifications
- Code reviews verify traceability
- Session history maintained in `/history/`

---

## References

- **Phase I Documentation:** `/CLAUDE.md`
- **Phase II Constitution:** `/CONSTITUTION_PHASE2.md`
- **Frontend Guide:** `/frontend/CLAUDE.md`
- **Backend Guide:** `/backend/CLAUDE.md`
- **Specifications:** `/specs/`
- **Spec-Kit Config:** `/.spec-kit/config.yaml`

---

## Support and Questions

**For Claude Code:**
1. Read relevant CLAUDE.md file
2. Read relevant specification in `/specs/`
3. Follow Spec-Kit Plus methodology
4. Generate code from specs, never manually

**For Humans:**
1. Review generated code
2. Test functionality
3. Update specifications if issues found
4. Request regeneration from Claude Code

---

**Key Takeaway:** Phase II builds on Phase I by adding web, database, and multi-user capabilities while preserving the core domain and application layers. Frontend and backend are separate services communicating via REST API with JWT authentication.

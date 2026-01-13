# Todo App - Phase II

**Full-Stack Multi-User Web Application**

Built with **Spec-Kit Plus** methodology using **Claude Code** AI-assisted development.

---

## Overview

Phase II transforms the Phase I CLI application into a production-ready, multi-user web application with:

- ✅ **Next.js Frontend** with App Router and Tailwind CSS
- ✅ **FastAPI Backend** with Clean Architecture
- ✅ **PostgreSQL Database** (Neon Serverless)
- ✅ **JWT Authentication** (Better Auth)
- ✅ **Multi-User Isolation** with complete data security
- ✅ **REST API** with full CRUD operations
- ✅ **100% Spec-Driven** - Zero manual coding

---

## Project Structure

```
todo-app-phase2/
├── frontend/              # Next.js App Router application
│   ├── app/              # Pages and layouts
│   ├── components/       # React components
│   ├── lib/             # Utilities and API client
│   └── package.json
│
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── domain/       # Business entities (Phase I - UNCHANGED)
│   │   ├── application/  # Use cases (Phase I - UNCHANGED)
│   │   ├── infrastructure/  # Database repositories (NEW)
│   │   ├── presentation/    # REST API (NEW)
│   │   └── main.py
│   └── pyproject.toml
│
├── specs/                # All specifications
│   ├── overview.md
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
│
├── history/              # Session tracking
├── CONSTITUTION_PHASE2.md
└── CLAUDE_PHASE2.md
```

---

## Quick Start

### Prerequisites

- **Node.js** 20+ and npm 10+
- **Python** 3.11+
- **PostgreSQL** database (or Neon account)
- **Git** for version control

### 1. Clone and Setup

```bash
# Clone repository
git clone <repository-url>
cd todo-app-phase2

# Install all dependencies
npm run setup
```

### 2. Configure Environment

**Frontend:**
```bash
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local:
# - NEXT_PUBLIC_API_URL=http://localhost:8000
# - BETTER_AUTH_SECRET=<your-secret>
```

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env:
# - DATABASE_URL=postgresql://...
# - BETTER_AUTH_SECRET=<same-as-frontend>
```

### 3. Run Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# or
cd backend && python -m app.main
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

**Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Architecture

### Clean Architecture (Maintained from Phase I)

```
┌─────────────────────────────────────┐
│       FRONTEND (Next.js)             │
│  - React Components                  │
│  - Better Auth Client                │
│  - API Client                        │
└──────────────┬──────────────────────┘
               │ HTTPS + JWT
               ▼
┌─────────────────────────────────────┐
│       BACKEND (FastAPI)              │
│  ┌─────────────────────────────┐    │
│  │ Presentation (API)           │    │
│  │  - REST Endpoints            │    │
│  └─────────┬───────────────────┘    │
│            ▼                         │
│  ┌─────────────────────────────┐    │
│  │ Application (Use Cases)      │    │
│  │  - Business Logic            │    │
│  │  - PHASE I - UNCHANGED       │    │
│  └─────────┬───────────────────┘    │
│            ▼                         │
│  ┌─────────────────────────────┐    │
│  │ Domain (Entities)            │    │
│  │  - Task, TaskStatus          │    │
│  │  - PHASE I - UNCHANGED       │    │
│  └─────────┬───────────────────┘    │
│            ▲                         │
│  ┌─────────┴───────────────────┐    │
│  │ Infrastructure (DB)          │    │
│  │  - PostgreSQL Repository     │    │
│  └─────────────────────────────┘    │
└──────────────┬──────────────────────┘
               │ SQL
               ▼
┌─────────────────────────────────────┐
│    DATABASE (Neon PostgreSQL)        │
│  - users (Better Auth)               │
│  - tasks (user_id FK)                │
└─────────────────────────────────────┘
```

---

## Key Features

### 1. Multi-User Support

- **Complete data isolation** between users
- **JWT authentication** on every request
- **User-scoped repositories** automatically filter by user_id
- **Defense in depth** security at every layer

### 2. REST API

**Endpoints:**
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks` - List tasks
- `GET /api/{user_id}/tasks/{id}` - Get single task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Mark complete
- `PATCH /api/{user_id}/tasks/{id}/uncomplete` - Mark incomplete

**Authentication:**
- All endpoints require `Authorization: Bearer <JWT>` header
- JWT must contain valid user_id matching URL parameter

### 3. Database Persistence

- **PostgreSQL** via Neon Serverless
- **SQLModel** ORM for type-safe queries
- **Automatic migrations** with Alembic
- **Foreign key constraints** enforce data integrity

### 4. Frontend

- **Next.js 14+** with App Router
- **Server and Client Components**
- **Tailwind CSS** for styling
- **Better Auth** for authentication
- **TypeScript** for type safety

---

## Development

### Spec-Kit Plus Methodology

**This project uses AI-assisted, specification-driven development:**

1. **Human writes specifications** in `/specs/`
2. **Claude Code generates ALL code** from specs
3. **Human reviews and tests** generated code
4. **Iterate on specs**, not code

**Zero manual coding.** All code is generated by AI from specifications.

### Project Governance

**Read:** `CONSTITUTION_PHASE2.md`

Key rules:
- ✅ All code generated from specifications
- ✅ Domain and Application layers from Phase I unchanged
- ✅ Clean Architecture strictly enforced
- ✅ Multi-user security mandatory
- ✅ Complete audit trail maintained

### Development Guides

- **Frontend Development:** `frontend/CLAUDE.md`
- **Backend Development:** `backend/CLAUDE.md`
- **Phase II Overview:** `CLAUDE_PHASE2.md`

---

## Testing

**Frontend:**
```bash
cd frontend
npm run lint
npm run build
```

**Backend:**
```bash
cd backend
pytest
```

---

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Render/Railway)

```bash
cd backend
# Configure DATABASE_URL in environment
# Deploy to Render or Railway
```

### Database (Neon)

1. Create Neon project
2. Copy connection string
3. Update `DATABASE_URL` in backend `.env`

---

## Comparison: Phase I vs Phase II

| Feature | Phase I | Phase II |
|---------|---------|----------|
| **Interface** | CLI (REPL) | Web (Next.js) |
| **Storage** | In-memory dict | PostgreSQL (Neon) |
| **Users** | Single user | Multi-user with isolation |
| **Auth** | None | JWT (Better Auth) |
| **API** | None | REST (FastAPI) |
| **Architecture** | Clean Architecture | Clean Architecture (preserved) |
| **Deployment** | Local only | Cloud-ready |
| **Domain Layer** | Task, TaskStatus | **Unchanged** |
| **Application Layer** | 6 use cases | **Unchanged** |
| **Infrastructure** | InMemoryRepo | PostgreSQLRepo |
| **Presentation** | CLI handlers | FastAPI routers |

**Key Insight:** Phase I domain and application layers are 100% reused in Phase II, demonstrating the power of Clean Architecture.

---

## Specifications

All specifications are in `/specs/`:

- **Overview:** `specs/overview.md`
- **Features:** `specs/features/` (task-crud, authentication, task-ownership)
- **API:** `specs/api/rest-endpoints.md`
- **Database:** `specs/database/schema.md`
- **UI:** `specs/ui/` (pages, components)

**Every line of code traces back to a specification.**

---

## Contributing

1. **Update specifications first** in `/specs/`
2. **Request Claude Code regeneration** from updated specs
3. **Review generated code** for correctness
4. **Test thoroughly**
5. **Document in session history** (`/history/`)

**Do not manually edit code.** Update specs and regenerate.

---

## License

MIT License - See LICENSE file for details.

---

## Acknowledgments

- **Claude Code** (Anthropic) - AI development assistant
- **Spec-Kit Plus** - Specification-driven methodology
- **Clean Architecture** - Robert C. Martin (Uncle Bob)

---

## Support

- **Documentation:** See `/CLAUDE_PHASE2.md` and layer-specific `CLAUDE.md` files
- **Specifications:** Review `/specs/` directory
- **Issues:** Check session history in `/history/`

---

**Built with AI. Governed by Specifications. Powered by Clean Architecture.**

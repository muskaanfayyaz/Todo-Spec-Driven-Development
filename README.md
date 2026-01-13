# Todo App - Full-Stack Multi-User Application

**Version:** Phase II (v2.0) — Production-Ready
**Architecture:** Clean Architecture with Multi-User Support
**Deployment:** Vercel (Frontend) + Neon (Database)

A professionally architected full-stack todo application demonstrating Clean Architecture principles, spec-driven development, and AI-assisted code generation. **Phase I** implemented a CLI application, **Phase II** extends it to a multi-user web application with authentication, REST API, and modern web UI.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Quick Start](#quick-start)
- [Phase Evolution](#phase-evolution)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Development Approach](#development-approach)

---

## Overview

This project is a **full-stack todo application** built in two phases:

- **Phase I:** Command-line interface (CLI) with in-memory storage
- **Phase II:** Multi-user web application with authentication and database persistence

**Key Highlights:**
- ✅ **Clean Architecture** — Domain, Application, Infrastructure, Presentation layers
- ✅ **Spec-Driven Development** — All code generated from detailed specifications
- ✅ **Multi-User Support** — User authentication with JWT and data isolation
- ✅ **Modern Web Stack** — Next.js frontend + FastAPI backend + PostgreSQL database
- ✅ **Production-Ready** — Deployable to Vercel + Neon with comprehensive testing
- ✅ **AI-Assisted Development** — Built using Claude Code (Spec-Kit Plus methodology)

---

## Live Demo

**Frontend:** [https://yourdomain.vercel.app](https://yourdomain.vercel.app) *(Update after deployment)*
**Backend API:** [https://api.yourdomain.com](https://api.yourdomain.com) *(Update after deployment)*

**Test Credentials:**
- Use the registration page to create your own account
- Each user has isolated task data

---

## Quick Start

### Development Environment

**Prerequisites:**
- Node.js 20+ and npm 10+
- Python 3.13+
- Git

**Clone and Setup:**
```bash
# 1. Clone repository
git clone <repository-url>
cd todo-cli-phase1

# 2. Install dependencies (frontend + backend)
npm run setup

# 3. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edit both files with your configuration (see ENVIRONMENT_SETUP.md)

# 4. Start development servers
# Terminal 1 - Backend (FastAPI)
npm run dev:backend

# Terminal 2 - Frontend (Next.js)
npm run dev:frontend
```

**Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Phase Evolution

### Phase I: CLI Application (v1.0)

**Status:** ✅ Complete
**Location:** `/src/` directory

**Features:**
- Menu-driven command-line interface
- In-memory task storage
- Six core operations (Add, List, Update, Delete, Complete, Uncomplete)
- Clean Architecture implementation
- Zero external dependencies (Python stdlib only)

**Run Phase I:**
```bash
cd src
python3 main.py
```

**Documentation:** [Phase I README](history/README.md) | [CLAUDE.md](CLAUDE.md) | [CONSTITUTION.md](CONSTITUTION.md)

---

### Phase II: Web Application (v2.0)

**Status:** ✅ Complete
**Location:** `/frontend/` and `/backend/` directories

**New Features:**
- 🔐 **User Authentication** — Better Auth with JWT tokens
- 🌐 **REST API** — FastAPI backend with OpenAPI documentation
- 💾 **Database Persistence** — Neon PostgreSQL (serverless)
- 🎨 **Modern Web UI** — Next.js 14+ with Tailwind CSS
- 👥 **Multi-User Support** — User isolation and ownership
- 🚀 **Production Ready** — Vercel deployment with environment configuration

**Core Principles:**
- ✅ **Phase I Preserved** — Domain and Application layers unchanged
- ✅ **Spec Compliance** — All features from specifications implemented
- ✅ **Clean Architecture** — Proper layer separation maintained
- ✅ **Security First** — JWT auth, user isolation, validation at all layers

**Documentation:** [Phase II README](README_PHASE2.md) | [CLAUDE_PHASE2.md](CLAUDE_PHASE2.md) | [CONSTITUTION_PHASE2.md](CONSTITUTION_PHASE2.md)

---

## Tech Stack

### Frontend (Next.js)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14+ | React framework with App Router |
| **React** | 18+ | UI library |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 3+ | Utility-first styling |
| **Better Auth** | Latest | Authentication library |

### Backend (FastAPI)

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | Latest | Modern Python web framework |
| **SQLModel** | Latest | Type-safe ORM (SQLAlchemy + Pydantic) |
| **Pydantic** | 2+ | Data validation |
| **PyJWT** | Latest | JWT token verification |
| **Uvicorn** | Latest | ASGI server |
| **Alembic** | Latest | Database migrations |

### Database & Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| **Neon PostgreSQL** | 15+ | Serverless PostgreSQL database |
| **Vercel** | Latest | Frontend hosting platform |
| **Render/Railway** | Latest | Backend hosting (alternative platforms) |

---

## Architecture

### Clean Architecture Layers

```
┌───────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                          │
│  Phase I: CLI Interface (src/presentation/)                   │
│  Phase II: REST API + Web UI (backend/app/presentation/,      │
│            frontend/app/, frontend/components/)                │
│  - API routes (FastAPI)                                        │
│  - React components (Next.js)                                  │
│  - Request/response schemas                                    │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                    APPLICATION LAYER                           │
│  (UNCHANGED FROM PHASE I)                                      │
│  Location: backend/app/application/                            │
│  - Use Cases: AddTask, ListTasks, UpdateTask, etc.           │
│  - Repository interface (abstract)                            │
│  - Business logic orchestration                               │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                      DOMAIN LAYER                              │
│  (UNCHANGED FROM PHASE I)                                      │
│  Location: backend/app/domain/                                 │
│  - Task entity with validation                                │
│  - TaskStatus value object                                    │
│  - Domain exceptions                                           │
│  - Business rules                                              │
└────────────────────────┬──────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                          │
│  Phase I: In-memory repository (src/infrastructure/)          │
│  Phase II: PostgreSQL repository (backend/app/infrastructure/)│
│  - Database models (SQLModel)                                  │
│  - PostgreSQL repository implementation                        │
│  - External service integrations                               │
└───────────────────────────────────────────────────────────────┘
```

### Multi-User Data Flow

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │
       │ 1. Login/Register
       ▼
┌─────────────────────────┐
│   Better Auth Server    │
│  (Next.js API Routes)   │
│                         │
│  - Creates user in DB   │
│  - Generates JWT token  │
│  - Returns to frontend  │
└──────┬──────────────────┘
       │
       │ 2. API Request (with JWT)
       ▼
┌─────────────────────────┐
│   FastAPI Backend       │
│                         │
│  - Verifies JWT         │
│  - Extracts user_id     │
│  - Validates access     │
└──────┬──────────────────┘
       │
       │ 3. Query with user_id filter
       ▼
┌─────────────────────────┐
│   PostgreSQL Database   │
│  (Neon)                 │
│                         │
│  SELECT * FROM tasks    │
│  WHERE user_id = ?      │
└─────────────────────────┘
```

---

## Features

### Core Features (All Phases)

- ✅ **Create Tasks** — Add tasks with title and optional description
- ✅ **List Tasks** — View all tasks with filtering options
- ✅ **Update Tasks** — Modify task title and description
- ✅ **Delete Tasks** — Remove tasks permanently
- ✅ **Complete/Uncomplete** — Toggle task completion status
- ✅ **Input Validation** — Comprehensive validation at all layers

### Phase II Additional Features

- 🔐 **User Authentication** — Email/password with Better Auth
- 👤 **User Registration** — Self-service account creation
- 🔑 **JWT Tokens** — Secure stateless authentication
- 🔒 **User Isolation** — Each user sees only their own tasks
- 🌐 **REST API** — RESTful endpoints with OpenAPI docs
- 🎨 **Modern Web UI** — Responsive design with Tailwind CSS
- 📱 **Mobile Friendly** — Works on all device sizes
- ⚡ **Real-time Updates** — Optimistic UI updates
- 🛡️ **Security** — Defense-in-depth validation strategy

---

## Project Structure

```
todo-cli-phase1/
├── frontend/                    # Next.js application (Phase II)
│   ├── app/                     # App Router pages and layouts
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/           # Login page
│   │   │   └── register/        # Registration page
│   │   ├── tasks/               # Task management page
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home/redirect page
│   ├── components/              # Reusable React components
│   │   └── tasks/               # Task-specific components
│   ├── lib/                     # Utilities and API clients
│   │   ├── api-client.ts        # Backend API client
│   │   ├── auth.ts              # Better Auth client
│   │   └── auth-server.ts       # Better Auth server
│   ├── .env.local               # Environment variables (not committed)
│   └── package.json             # Frontend dependencies
│
├── backend/                     # FastAPI application (Phase II)
│   ├── app/
│   │   ├── domain/              # Domain layer (from Phase I)
│   │   │   ├── entities/        # Task entity
│   │   │   ├── value_objects/   # TaskStatus enum
│   │   │   └── exceptions.py    # Domain exceptions
│   │   ├── application/         # Application layer (from Phase I)
│   │   │   ├── interfaces/      # Repository interface
│   │   │   └── use_cases/       # Business logic use cases
│   │   ├── infrastructure/      # Infrastructure layer (new)
│   │   │   ├── models.py        # SQLModel database models
│   │   │   └── repositories/    # PostgreSQL repository
│   │   ├── presentation/        # Presentation layer (new)
│   │   │   ├── routers/         # FastAPI routers
│   │   │   └── schemas/         # Pydantic request/response schemas
│   │   ├── auth.py              # JWT verification
│   │   ├── config.py            # Configuration management
│   │   ├── database.py          # Database connection
│   │   └── main.py              # FastAPI application entry point
│   ├── alembic/                 # Database migrations
│   ├── .env                     # Environment variables (not committed)
│   └── pyproject.toml           # Backend dependencies
│
├── src/                         # Phase I CLI application (preserved)
│   ├── domain/                  # Domain layer
│   ├── application/             # Application layer
│   ├── infrastructure/          # In-memory repository
│   ├── presentation/            # CLI interface
│   └── main.py                  # CLI entry point
│
├── specs/                       # Comprehensive specifications
│   ├── overview.md              # Project overview
│   ├── architecture_spec.md     # Architecture decisions (Phase I)
│   ├── functional_spec.md       # Functional requirements (Phase I)
│   ├── cli_flow_spec.md         # CLI interface spec (Phase I)
│   ├── phase2-plan.md           # Phase II implementation plan
│   ├── api/                     # API specifications
│   │   └── rest-endpoints.md    # REST API specification
│   ├── database/                # Database specifications
│   │   └── schema.md            # PostgreSQL schema
│   ├── features/                # Feature specifications
│   │   ├── task-crud.md         # Task CRUD operations
│   │   └── authentication.md    # Authentication flows
│   └── ui/                      # UI specifications
│       ├── pages.md             # Page specifications
│       └── components.md        # Component specifications
│
├── history/                     # Development audit trail
│   ├── chunk-docs/              # Implementation phase documents
│   └── README.md                # Historical documentation
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Monorepo scripts
├── README.md                    # This file
├── README_PHASE2.md             # Phase II detailed documentation
├── ENVIRONMENT_SETUP.md         # Environment variables guide
├── CONSTITUTION_PHASE2.md       # Phase II architectural rules
├── CLAUDE_PHASE2.md             # AI development guide
└── CHUNK6_INTEGRATION_COMPLETE.md  # Integration documentation
```

---

## Setup Instructions

### Prerequisites

**Required:**
- Node.js 20+ and npm 10+
- Python 3.13+
- Git

**Optional (for production):**
- Neon account (free tier available)
- Vercel account (free tier available)

### Development Setup

**1. Clone Repository:**
```bash
git clone <repository-url>
cd todo-cli-phase1
```

**2. Install Dependencies:**
```bash
# Install both frontend and backend dependencies
npm run setup

# Or install separately:
npm run install:frontend  # Frontend only
npm run install:backend   # Backend only
```

**3. Configure Environment Variables:**

See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for comprehensive guide.

**Quick Setup:**
```bash
# Generate shared secret
openssl rand -base64 32

# Backend (.env)
cp backend/.env.example backend/.env
# Edit backend/.env:
# - Add generated secret to BETTER_AUTH_SECRET
# - Use SQLite for local dev: DATABASE_URL=sqlite:///./test.db

# Frontend (.env.local)
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local:
# - Add same secret to BETTER_AUTH_SECRET
# - Use SQLite for local dev: DATABASE_URL=sqlite://./auth.db
```

**4. Start Development Servers:**
```bash
# Terminal 1 - Backend (http://localhost:8000)
npm run dev:backend

# Terminal 2 - Frontend (http://localhost:3000)
npm run dev:frontend
```

**5. Access Application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs (Swagger UI)

---

## Deployment

### Production Deployment Guide

**Prerequisites:**
- Neon PostgreSQL database (free tier available)
- Vercel account (free tier available)
- Backend hosting (Render, Railway, or Fly.io)

### Step 1: Neon Database Setup

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string (format: `postgresql://user:password@host.neon.tech/neondb?sslmode=require`)
4. Save for later use

### Step 2: Backend Deployment (Render/Railway)

**Using Render:**

1. Create new Web Service
2. Connect GitHub repository
3. Configure build:
   ```bash
   Build Command: pip install -e .
   Start Command: python -m app.main
   ```
4. Set environment variables:
   ```bash
   DATABASE_URL=<neon-connection-string>
   BETTER_AUTH_SECRET=<production-secret>
   CORS_ORIGINS=["https://yourdomain.vercel.app"]
   DEBUG=false
   ```
5. Deploy and note the backend URL

**Run Migrations:**
```bash
# Locally, pointing to production database
export DATABASE_URL=<neon-connection-string>
cd backend
alembic upgrade head
```

### Step 3: Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy:
   ```bash
   cd frontend
   vercel
   ```
3. Set environment variables in Vercel dashboard:
   ```bash
   NEXT_PUBLIC_API_URL=<backend-url-from-step-2>
   BETTER_AUTH_SECRET=<same-as-backend-secret>
   BETTER_AUTH_URL=<your-vercel-url>
   DATABASE_URL=<neon-connection-string>
   ```
4. Redeploy to apply variables

### Step 4: Verification

1. Visit your Vercel URL
2. Register a new user
3. Create a task
4. Verify data persists after refresh
5. Test logout and login

**Troubleshooting:** See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) Troubleshooting section.

---

## Documentation

### Core Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](README.md) | This file - Project overview | Everyone |
| [README_PHASE2.md](README_PHASE2.md) | Phase II detailed documentation | Developers |
| [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) | Environment variables guide | DevOps/Developers |
| [CONSTITUTION_PHASE2.md](CONSTITUTION_PHASE2.md) | Architectural rules and constraints | Developers/Architects |
| [CLAUDE_PHASE2.md](CLAUDE_PHASE2.md) | AI-assisted development guide | AI/Developers |

### Integration Documentation

| Document | Purpose |
|----------|---------|
| [CHUNK6_INTEGRATION_COMPLETE.md](CHUNK6_INTEGRATION_COMPLETE.md) | Integration architecture and testing guide |
| [CHUNK6_VALIDATION_CHECKLIST.md](CHUNK6_VALIDATION_CHECKLIST.md) | Comprehensive validation verification |

### API Documentation

- **Swagger UI:** http://localhost:8000/docs (when backend is running)
- **Specification:** [specs/api/rest-endpoints.md](specs/api/rest-endpoints.md)

### Database Documentation

- **Schema Specification:** [specs/database/schema.md](specs/database/schema.md)
- **Migrations:** `backend/alembic/versions/`

---

## Development Approach

### Spec-Kit Plus Methodology

This project was built using **Spec-Kit Plus**, a specification-driven development methodology with AI assistance:

**Process:**
1. **Specifications First** — Write detailed specs before any code
2. **AI Code Generation** — Use Claude Code to generate code from specs
3. **Zero Manual Coding** — All code generated from specifications
4. **Iterative Refinement** — Update specs and regenerate as needed

**Benefits:**
- ✅ **Consistent Quality** — All code follows same patterns
- ✅ **Complete Documentation** — Specs serve as documentation
- ✅ **Rapid Development** — Generate complete features in minutes
- ✅ **Easy Maintenance** — Update specs, regenerate code

**AI Tool:** [Claude Code](https://claude.ai/claude-code) (Anthropic)
**Methodology:** Spec-Kit Plus
**Code Generated:** 100% (0 lines manually written)

### Architecture Principles

**Clean Architecture:**
- Dependencies point inward (Presentation → Application → Domain)
- Domain layer is framework-agnostic and self-contained
- Use cases orchestrate business logic
- Infrastructure implements interfaces defined by inner layers

**Phase II Constraints:**
- ✅ Phase I domain and application layers UNCHANGED
- ✅ Only infrastructure and presentation layers modified
- ✅ New features implemented through new infrastructure/presentation code
- ✅ Clean Architecture principles maintained throughout

---

## Contributing

This is a demonstration project for spec-driven development and Clean Architecture. Contributions should:

1. Update specifications first (in `specs/`)
2. Generate code using AI tools (Claude Code recommended)
3. Maintain Clean Architecture layer separation
4. Ensure all tests pass
5. Update documentation

**Before Contributing:**
- Read [CONSTITUTION_PHASE2.md](CONSTITUTION_PHASE2.md) for architectural rules
- Review [CLAUDE_PHASE2.md](CLAUDE_PHASE2.md) for AI development workflow
- Check specifications in `specs/` directory

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- **Claude Code** — AI-powered development assistant by Anthropic
- **Spec-Kit Plus** — Specification-driven development methodology
- **Clean Architecture** — Robert C. Martin (Uncle Bob)
- **Better Auth** — Modern authentication library for Next.js
- **Neon** — Serverless PostgreSQL platform

---

## Project Status

- ✅ **Phase I:** Complete (CLI application)
- ✅ **Phase II:** Complete (Web application with multi-user support)
- 🚀 **Production:** Ready for deployment

**Last Updated:** January 7, 2026
**Version:** 2.0.0
**Built With:** Claude Code (Spec-Kit Plus)

---

**Questions or Issues?**
- Review documentation in `/specs/` directory
- Check troubleshooting in [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
- Refer to integration guide in [CHUNK6_INTEGRATION_COMPLETE.md](CHUNK6_INTEGRATION_COMPLETE.md)

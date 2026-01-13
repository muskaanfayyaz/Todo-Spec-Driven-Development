# Role and Authority - Phase II Development

**Document Version:** 1.0
**Last Updated:** January 3, 2026
**Project:** Todo App - Hackathon II Phase II
**AI Agent:** Claude Code (Sonnet 4.5)

---

## My Role

**Senior AI Software Architect and Spec-Driven Development Expert**

I am responsible for transforming the Phase I console Todo application into a Full-Stack Web Application following the Nine Pillars of AI-Driven Development and Spec-Kit Plus methodology.

---

## Authority & Constraints

### STRICT RULES (Non-Negotiable)

1. **Spec-Driven Development Only**
   - NO code generation without finalized specifications
   - Must follow: Spec → Plan → Tasks → Implement

2. **Agentic Dev Stack Workflow**
   - Use Spec-Kit Plus for all development phases
   - Every implementation must map to a validated task

3. **Hackathon Phase II Compliance**
   - Follow all hackathon rules and requirements
   - Submit deliverables per specification

4. **NO Manual Coding by User**
   - User provides specifications only
   - I generate all implementation code

5. **NO Assumptions Outside Specs**
   - Request clarification when requirements unclear
   - Never invent features or implementations

6. **Implementation After Specs Finalized**
   - Constitution → Specify → Plan → Tasks → Implement
   - Never skip stages

---

## Phase II Objectives

### Transform Console App → Full-Stack Web Application

**Core Requirements (MANDATORY):**

1. **All 5 Basic Todo Features**
   - Add Task
   - Delete Task
   - Update Task
   - View Tasks
   - Mark Complete

2. **Multi-User Support**
   - Each user has isolated tasks
   - No data leakage between users
   - User-scoped data access

3. **Persistent Storage**
   - Neon Serverless PostgreSQL
   - SQLModel ORM
   - Proper schema design

4. **Authentication**
   - Better Auth (Next.js frontend)
   - JWT-based authentication
   - JWT verification in FastAPI backend
   - Shared secret key for token signing/verification

5. **REST API**
   - Secure, authenticated endpoints
   - User-scoped data access
   - Proper error handling

6. **Responsive Web UI**
   - Built with Next.js App Router
   - Clean, minimal task interface
   - Good UX/UI practices

---

## Technology Stack (STRICT - Non-Negotiable)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 16+ (App Router) |
| Backend | FastAPI | Latest (Python) |
| ORM | SQLModel | Latest |
| Database | Neon Serverless PostgreSQL | Latest |
| Authentication | Better Auth | Latest |
| Spec System | Spec-Kit Plus | Latest |
| AI Tool | Claude Code | Sonnet 4.5 |

**Additional Tools:**
- Docker (containerization)
- Helm Charts (deployment)
- Kubernetes (orchestration)
- Minikube (local K8s)

---

## Monorepo Structure (REQUIRED)

```
/
├── Constitution                    # Project principles & constraints
├── .spec-kit/
│   └── config.yaml                # Spec-Kit Plus configuration
├── /specs/
│   ├── overview.md                # Project overview
│   ├── architecture.md            # System architecture
│   ├── features/                  # Feature specifications
│   │   ├── task-crud.md
│   │   └── authentication.md
│   ├── api/                       # API specifications
│   │   └── rest-endpoints.md
│   ├── database/                  # Database specifications
│   │   └── schema.md
│   └── ui/                        # UI specifications
│       ├── components.md
│       └── pages.md
├── /frontend/
│   ├── CLAUDE.md                  # Frontend-specific instructions
│   └── ... (Next.js app)
├── /backend/
│   ├── CLAUDE.md                  # Backend-specific instructions
│   └── ... (FastAPI app)
├── /history/                      # Session tracking
│   └── sessions/
├── CLAUDE.md                      # Root Claude Code instructions
├── ROLE_AND_AUTHORITY.md          # This file
└── README.md                      # Project documentation
```

---

## API Endpoints Specification

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{user_id}/tasks | List all tasks for user |
| POST | /api/{user_id}/tasks | Create a new task |
| GET | /api/{user_id}/tasks/{id} | Get task details |
| PUT | /api/{user_id}/tasks/{id} | Update a task |
| DELETE | /api/{user_id}/tasks/{id} | Delete a task |
| PATCH | /api/{user_id}/tasks/{id}/complete | Toggle completion |

**Security:**
- All endpoints require JWT token
- Authorization: Bearer <token> header
- Backend validates JWT and matches user_id
- Requests without valid token → 401 Unauthorized

---

## Database Schema

### users (managed by Better Auth)
- `id`: string (primary key)
- `email`: string (unique)
- `name`: string
- `created_at`: timestamp

### tasks
- `id`: integer (primary key)
- `user_id`: string (foreign key → users.id)
- `title`: string (not null, 1-200 chars)
- `description`: text (nullable, max 1000 chars)
- `completed`: boolean (default false)
- `created_at`: timestamp
- `updated_at`: timestamp

### Indexes
- `tasks.user_id` (for filtering by user)
- `tasks.completed` (for status filtering)

---

## Authentication Flow

1. **User logs in on Frontend** → Better Auth creates session + issues JWT token
2. **Frontend makes API call** → Includes JWT token in Authorization: Bearer <token> header
3. **Backend receives request** → Extracts token, verifies signature using shared secret
4. **Backend identifies user** → Decodes token to get user ID, matches with URL user_id
5. **Backend filters data** → Returns only tasks belonging to that user

**Shared Secret:**
- Both frontend and backend use `BETTER_AUTH_SECRET`
- Environment variable in both services

---

## Development Workflow (Agentic Dev Stack)

### Phase 1: Constitution (WHY)
- Define principles & constraints
- Set non-negotiables
- Establish architecture values

### Phase 2: Specify (WHAT)
- Capture requirements
- Define user journeys
- Set acceptance criteria

### Phase 3: Plan (HOW)
- Design architecture
- Define components
- Map interfaces

### Phase 4: Tasks (BREAKDOWN)
- Create atomic tasks
- Link to specs
- Set dependencies

### Phase 5: Implement (CODE)
- Generate code from tasks
- Validate against specs
- Ensure traceability

---

## What I Can Do

✅ Read and analyze specification documents
✅ Generate complete architecture from specs
✅ Implement Clean Architecture patterns
✅ Create modular, maintainable code
✅ Handle imports and dependencies
✅ Test and validate implementations
✅ Create comprehensive documentation
✅ Fix errors and debug automatically

---

## What I Cannot Do

❌ Write code without approved specifications
❌ Make assumptions about requirements
❌ Skip workflow stages
❌ Ignore architectural constraints
❌ Proceed with ambiguous requirements
❌ Generate code manually typed by user

---

## Success Criteria

### For Phase II:
1. ✅ All 5 basic features working as web app
2. ✅ Multi-user support with complete isolation
3. ✅ Persistent storage with Neon PostgreSQL
4. ✅ Secure authentication with Better Auth + JWT
5. ✅ RESTful API with proper security
6. ✅ Responsive Next.js frontend
7. ✅ Complete monorepo structure
8. ✅ All specifications documented
9. ✅ Deployed and accessible
10. ✅ 100% spec-driven (no manual coding)

---

## Deliverables

1. **GitHub Repository**
   - All source code for frontend and backend
   - /specs folder with all specifications
   - CLAUDE.md with instructions
   - README.md with documentation
   - Monorepo structure

2. **Deployed Application**
   - Frontend URL (Vercel)
   - Backend API URL
   - Working authentication
   - All features functional

3. **Demo Video**
   - Maximum 90 seconds
   - Demonstrate all features
   - Show spec-driven workflow

4. **Documentation**
   - Setup instructions
   - API documentation
   - Architecture diagrams
   - Deployment guide

---

## Contact & Support

**Hackathon:** Panaversity Hackathon II
**Deadline:** December 14, 2025 (Phase II)
**Submission:** https://forms.gle/KMKEKaFUD6ZX4UtY8

---

**Document Status:** Active
**Next Review:** After Phase II completion
**Maintained By:** Claude Code (AI) + User (Human Architect)

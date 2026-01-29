# Todo App - Full-Stack Multi-User Application

**Architecture:** Phase-Based Clean Architecture
**Methodology:** Spec-Kit Plus (AI-Assisted Specification-Driven Development)

A professionally architected full-stack todo application demonstrating Clean Architecture principles, spec-driven development, and AI-assisted code generation.

---

## Project Structure

```
/
├── phase1/                     # Phase 1: CLI Application
│   ├── src/                    # Python CLI source code
│   ├── specs/                  # Phase 1 specifications
│   ├── .venv/                  # Python virtual environment
│   ├── CLAUDE.md               # Claude Code instructions
│   └── CONSTITUTION.md         # Phase 1 constitution
│
├── phase2/                     # Phase 2: Web Application
│   ├── frontend/               # Next.js frontend
│   ├── backend/                # FastAPI backend
│   ├── specs/                  # Phase 2 specifications
│   ├── CLAUDE.md               # Claude Code instructions
│   ├── CONSTITUTION.md         # Phase 2 constitution
│   └── README.md               # Phase 2 documentation
│
├── .git/                       # Git repository
├── .gitignore                  # Git ignore rules
├── .claude/                    # Claude Code settings
├── .spec-kit/                  # Spec-Kit configuration
└── README.md                   # This file
```

---

## Phase 1: CLI Application

**Location:** `/phase1`

A command-line interface (CLI) todo application with in-memory storage, demonstrating Clean Architecture in Python.

### Features
- Add, list, update, delete tasks
- Mark tasks as complete/incomplete
- In-memory storage (no database)
- Clean Architecture (Domain, Application, Infrastructure, Presentation layers)

### Quick Start
```bash
cd phase1/src
python3 main.py
```

### Documentation
- `phase1/CLAUDE.md` - Development documentation
- `phase1/CONSTITUTION.md` - Architecture rules
- `phase1/specs/` - Specifications

---

## Phase 2: Web Application

**Location:** `/phase2`

A full-stack multi-user web application with authentication, REST API, and modern web UI.

### Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python, SQLAlchemy
- **Database:** PostgreSQL (Neon)
- **Auth:** Better Auth with JWT

### Quick Start

**Frontend:**
```bash
cd phase2/frontend
npm install
npm run dev
```

**Backend:**
```bash
cd phase2/backend
pip install -r requirements.txt
python -m app.main
```

### Documentation
- `phase2/README.md` - Phase 2 overview
- `phase2/CLAUDE.md` - Development instructions
- `phase2/CONSTITUTION.md` - Architecture rules
- `phase2/specs/` - API, UI, Database specifications

---

## Phase 3: AI-Powered Chat Assistant

**Location:** `/phase-3`

Extends the Phase 2 application with a powerful, conversational AI assistant for managing tasks. The chatbot is integrated directly into the web UI.

### Tech Stack
- **AI:** Google Gemini (`gemini-2.0-flash`)
- **Backend:** The existing Phase 2 FastAPI app is extended with a new `/chat` endpoint. The core application logic is not replaced, only augmented.

### Features
- **Conversational Task Management:** Users can interact with the chatbot using natural language to manage their to-do list.
- **Floating Chat Interface:** A non-intrusive chat panel is available on all authenticated pages.
- **Supported Commands:**
  - "Add a new task to buy groceries"
  - "What are my pending tasks?"
  - "Complete task number 15"
  - "Show me everything"
  - "Delete the grocery task"

### Quick Start
The Phase 3 backend is the new primary entry point for the entire application.

```bash
# From repository root, first install requirements
pip install -r phase2/backend/requirements.txt

# Run the backend (which now includes Phase 2 and 3)
cd phase-3/backend
uvicorn api.main:app --reload
```

### Documentation
- `phase-3/specs/` - Specifications for the agent and chat API.

---

## Development Approach

This project follows **Spec-Kit Plus** methodology:

1. **Specification First** - Detailed specs before code
2. **AI-Powered Generation** - Claude Code generates code from specs
3. **Clean Architecture** - Strict layer separation
4. **Phase-Based Evolution** - Incremental feature additions

---

## Key Files at Root

| File | Purpose |
|------|---------|
| `.git/` | Git repository (shared across phases) |
| `.gitignore` | Git ignore rules |
| `.claude/` | Claude Code settings |
| `.spec-kit/` | Spec-Kit Plus configuration |
| `Hackathon II...pdf` | Hackathon reference document |

---

## License

MIT License

---

**Built with Claude Code using Spec-Kit Plus methodology.**

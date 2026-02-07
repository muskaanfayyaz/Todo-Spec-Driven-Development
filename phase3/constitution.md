# PHASE III CONSTITUTION
## Spec-Driven Development Governance Document

**Document Status:** IMMUTABLE LAW
**Effective Date:** 2026-01-22
**Scope:** All development activities within Phase III of the Todo Evolution Project
**Authority:** This constitution supersedes all other guidance for Phase III implementation

---

## PREAMBLE

This Constitution establishes the absolute governing principles for Phase III: AI-Powered Todo Chatbot. All AI agents (Claude Code, Copilot, Gemini, or any other), human developers, and automated systems operating within this project MUST comply with every article herein.

**Violation of any article constitutes grounds for immediate work stoppage and mandatory correction.**

---

## ARTICLE I: DEVELOPMENT ORDER

### Section 1.1 - Mandatory Sequence

All development MUST follow this exact sequence without deviation:

```
SPECIFY → PLAN → TASKS → IMPLEMENT
```

| Stage | Artifact | Purpose | Gate |
|-------|----------|---------|------|
| 1. SPECIFY | `specs/*.specify.md` | Define WHAT to build | Human approval required |
| 2. PLAN | `specs/*.plan.md` | Define HOW to build | Technical review required |
| 3. TASKS | `specs/*.tasks.md` | Define atomic work units | Task ID assignment required |
| 4. IMPLEMENT | Source code | Execute approved tasks | Task ID reference required |

### Section 1.2 - Stage Completion Requirements

No stage may begin until its predecessor is:
1. Fully documented in the appropriate artifact
2. Explicitly approved by the user
3. Committed to version control (when applicable)

### Section 1.3 - Forward-Only Progression

Once a stage is approved:
- Regression to prior stages requires explicit user authorization
- All dependent artifacts must be updated if regression occurs
- Implementation code affected by regression must be removed or revised

---

## ARTICLE II: PROHIBITED ACTIONS

### Section 2.1 - Absolute Prohibitions

The following actions are STRICTLY FORBIDDEN:

| ID | Prohibition | Consequence |
|----|-------------|-------------|
| P-001 | Writing implementation code before spec approval | Immediate deletion of code |
| P-002 | Skipping any stage in the development sequence | Full rollback to skipped stage |
| P-003 | Modifying any file within `/phase2/` directory | Immediate reversion |
| P-004 | Modifying any file within `/phase1/` directory | Immediate reversion |
| P-005 | Creating code without referencing a Task ID | Code rejection |
| P-006 | Implementing features not defined in specs | Feature removal |
| P-007 | Storing conversation state in server memory | Architectural violation |
| P-008 | Bypassing MCP tools for task operations | Implementation rejection |
| P-009 | Direct database queries outside repository pattern | Code rejection |
| P-010 | Hardcoding credentials or secrets | Security violation |

### Section 2.2 - Conditional Prohibitions

The following require explicit user approval:

| ID | Action | Required Approval |
|----|--------|-------------------|
| C-001 | Adding new dependencies | User confirmation |
| C-002 | Modifying database schema beyond spec | Spec amendment + approval |
| C-003 | Creating new API endpoints beyond spec | Spec amendment + approval |
| C-004 | Changing MCP tool signatures | Spec amendment + approval |

---

## ARTICLE III: PHASE II CONTINUATION RULES

### Section 3.1 - Phase II Immutability

Phase II artifacts are READ-ONLY. This includes:

```
/phase2/
├── backend/           # IMMUTABLE - Do not modify
│   ├── app/
│   │   ├── domain/           # FROZEN
│   │   ├── application/      # FROZEN
│   │   ├── infrastructure/   # FROZEN
│   │   ├── presentation/     # FROZEN
│   │   ├── main.py          # FROZEN
│   │   ├── config.py        # FROZEN
│   │   ├── auth.py          # FROZEN
│   │   └── database.py      # FROZEN
│   └── ...
├── frontend/          # IMMUTABLE - Do not modify
└── specs/            # IMMUTABLE - Do not modify
```

### Section 3.2 - Permitted Phase II Interactions

Phase III code MAY:
1. **IMPORT** modules from Phase II (read-only access)
2. **CALL** Phase II functions and classes (no modifications)
3. **EXTEND** Phase II database with NEW tables only
4. **REUSE** Phase II authentication mechanisms

Phase III code MUST NOT:
1. Modify Phase II source files
2. Alter Phase II database tables
3. Change Phase II API endpoints
4. Override Phase II configurations

### Section 3.3 - Database Extension Rules

New tables for Phase III:

| Table | Owner | Relationship to Phase II |
|-------|-------|-------------------------|
| `conversation` | Phase III | FK to `user.id` (Phase II table) |
| `message` | Phase III | FK to `conversation.id` |

Existing tables (DO NOT MODIFY):
- `task` - Owned by Phase II
- `user` - Owned by Better Auth (Phase II)

---

## ARTICLE IV: STATELESS ARCHITECTURE RULES

### Section 4.1 - Server Statelessness Mandate

The FastAPI server MUST be completely stateless. This means:

1. **NO** in-memory conversation storage
2. **NO** in-memory session tracking
3. **NO** global mutable state
4. **NO** caching of user-specific data in memory
5. **NO** singleton patterns holding request state

### Section 4.2 - State Persistence Requirements

ALL state MUST be persisted to the database:

| State Type | Storage Location | Retrieval Method |
|------------|------------------|------------------|
| Conversation history | `message` table | Query by `conversation_id` |
| Conversation metadata | `conversation` table | Query by `user_id` |
| Task data | `task` table (Phase II) | Via MCP tools only |
| User identity | JWT token | Extracted per-request |

### Section 4.3 - Request Isolation

Each HTTP request MUST:
1. Be independently processable by any server instance
2. Carry all necessary authentication in headers
3. Retrieve all required state from database
4. Persist all state changes to database before response
5. Hold no references to prior requests in memory

### Section 4.4 - Horizontal Scalability Test

Architecture MUST pass this test:
> "If I deploy 10 identical server instances behind a load balancer,
> and requests are randomly distributed, will the system function correctly?"

If NO, the architecture violates this Constitution.

---

## ARTICLE V: MCP + AGENT ENFORCEMENT RULES

### Section 5.1 - MCP Tool Mandate

ALL task operations MUST flow through MCP tools:

```
User Message → Agent → MCP Tool → Database
                 ↑          ↓
                 └── Response ←┘
```

Direct task manipulation is FORBIDDEN:
```python
# FORBIDDEN - Direct database access for tasks
session.query(Task).filter(Task.id == task_id).first()

# REQUIRED - MCP tool invocation
mcp_server.call_tool("list_tasks", {"user_id": user_id, "status": "all"})
```

### Section 5.2 - Required MCP Tools

Phase III MUST implement exactly these 5 MCP tools:

| Tool Name | Parameters | Returns |
|-----------|------------|---------|
| `add_task` | `user_id`, `title`, `description?` | `{task_id, status, title}` |
| `list_tasks` | `user_id`, `status?` | `[{id, title, completed}, ...]` |
| `complete_task` | `user_id`, `task_id` | `{task_id, status, title}` |
| `delete_task` | `user_id`, `task_id` | `{task_id, status, title}` |
| `update_task` | `user_id`, `task_id`, `title?`, `description?` | `{task_id, status, title}` |

### Section 5.3 - Agent Behavior Rules

The OpenAI Agent MUST:
1. Use MCP tools for ALL task operations
2. Confirm actions with user-friendly responses
3. Handle errors gracefully with informative messages
4. Never fabricate task data not returned by tools
5. Never execute operations without appropriate tool calls

### Section 5.4 - Tool-to-UseCase Mapping

MCP tools MUST delegate to Phase II use cases:

| MCP Tool | Phase II Use Case |
|----------|-------------------|
| `add_task` | `AddTaskUseCase` |
| `list_tasks` | `ListTasksUseCase` |
| `complete_task` | `CompleteTaskUseCase` |
| `delete_task` | `DeleteTaskUseCase` |
| `update_task` | `UpdateTaskUseCase` |

---

## ARTICLE VI: DIRECTORY BOUNDARIES

### Section 6.1 - Phase III Directory Structure

ALL Phase III code MUST reside within:

```
/phase-3/
├── constitution.md          # THIS DOCUMENT (immutable)
├── specs/                   # Specification artifacts
│   ├── features/
│   │   └── chatbot.specify.md
│   ├── api/
│   │   ├── chat-endpoint.specify.md
│   │   └── mcp-tools.specify.md
│   ├── database/
│   │   └── conversation-schema.specify.md
│   └── plans/
│       └── *.plan.md
├── backend/                 # FastAPI + Agents SDK + MCP
│   ├── app/
│   │   ├── mcp/            # MCP server and tools
│   │   ├── agent/          # OpenAI Agents SDK integration
│   │   ├── models/         # SQLModel for conversation/message
│   │   ├── routers/        # Chat endpoint
│   │   └── main.py         # FastAPI app (extends Phase II)
│   ├── requirements.txt
│   └── CLAUDE.md
├── frontend/               # OpenAI ChatKit UI
│   ├── src/
│   ├── package.json
│   └── CLAUDE.md
└── CLAUDE.md               # Phase III navigation guide
```

### Section 6.2 - Boundary Enforcement

| Action | Permitted Location | Forbidden Location |
|--------|-------------------|-------------------|
| Create new Python files | `/phase-3/backend/` | `/phase2/`, `/phase1/` |
| Create new TypeScript files | `/phase-3/frontend/` | `/phase2/`, `/phase1/` |
| Create new specs | `/phase-3/specs/` | `/phase2/specs/` |
| Modify existing code | `/phase-3/` only | All other directories |

### Section 6.3 - Import Rules

```python
# PERMITTED - Importing from Phase II (read-only)
from phase2.backend.app.application.use_cases.add_task import AddTaskUseCase
from phase2.backend.app.infrastructure.repositories import PostgreSQLTaskRepository
from phase2.backend.app.database import get_session
from phase2.backend.app.auth import get_current_user

# FORBIDDEN - Relative imports that escape phase-3
from ...phase2.backend.app import something  # VIOLATION
```

---

## ARTICLE VII: VALIDATION GATES

### Section 7.1 - Gate Definitions

| Gate | Name | Entry Criteria | Exit Criteria |
|------|------|----------------|---------------|
| G-1 | Spec Gate | User request received | Spec approved by user |
| G-2 | Plan Gate | Spec approved | Plan approved by user |
| G-3 | Task Gate | Plan approved | Tasks enumerated and approved |
| G-4 | Implement Gate | Tasks approved | Code complete with Task ID refs |
| G-5 | Verify Gate | Code complete | Tests pass, user accepts |

### Section 7.2 - Gate Checklist Templates

#### G-1: Spec Gate Checklist
- [ ] Feature requirements documented
- [ ] Acceptance criteria defined
- [ ] User journey specified
- [ ] Edge cases enumerated
- [ ] User explicitly approves: "Spec approved"

#### G-2: Plan Gate Checklist
- [ ] Architecture diagram included
- [ ] Component responsibilities defined
- [ ] API contracts specified
- [ ] Data flow documented
- [ ] User explicitly approves: "Plan approved"

#### G-3: Task Gate Checklist
- [ ] Each task has unique ID (T-XXX)
- [ ] Each task references spec section
- [ ] Each task has clear deliverable
- [ ] Dependencies between tasks identified
- [ ] User explicitly approves: "Tasks approved"

#### G-4: Implement Gate Checklist
- [ ] All code references Task ID in comments
- [ ] No code exists without corresponding task
- [ ] All tests written and passing
- [ ] No prohibited actions committed

#### G-5: Verify Gate Checklist
- [ ] Feature works as specified
- [ ] Acceptance criteria met
- [ ] User confirms: "Feature accepted"

### Section 7.3 - Gate Violation Response

If a gate is attempted without satisfying entry criteria:

1. **STOP** all implementation work immediately
2. **REPORT** the violation to the user
3. **IDENTIFY** the missing criteria
4. **WAIT** for user direction before proceeding
5. **DO NOT** attempt workarounds or assumptions

---

## ARTICLE VIII: VIOLATION CONSEQUENCES

### Section 8.1 - Violation Classification

| Severity | Type | Example | Response |
|----------|------|---------|----------|
| CRITICAL | Phase II Modification | Editing `/phase2/` files | Immediate revert, full stop |
| CRITICAL | Stateful Server | In-memory conversation cache | Architecture redesign |
| HIGH | Skipped Stage | Coding before spec | Delete code, return to spec |
| HIGH | MCP Bypass | Direct task DB queries | Refactor through MCP |
| MEDIUM | Missing Task ID | Code without reference | Add reference or delete |
| LOW | Documentation Gap | Missing spec section | Document before proceeding |

### Section 8.2 - Violation Response Protocol

Upon detecting ANY violation:

```
1. HALT   → Stop current operation immediately
2. LOG    → Document what violation occurred
3. REPORT → Inform user of violation and article breached
4. AWAIT  → Wait for user instruction
5. REMEDY → Execute user-approved correction
6. VERIFY → Confirm violation is resolved
7. RESUME → Continue only after verification
```

### Section 8.3 - Self-Correction Mandate

AI agents operating under this Constitution MUST:
1. Self-monitor for potential violations BEFORE executing actions
2. Refuse to execute actions that would violate this Constitution
3. Explain WHY an action would violate the Constitution
4. Propose compliant alternatives

---

## ARTICLE IX: AMENDMENTS

### Section 9.1 - Amendment Process

This Constitution may ONLY be amended by:
1. Explicit user request stating: "Amend Constitution Article X"
2. Clear justification for the amendment
3. Written amendment text
4. User confirmation: "Amendment approved"

### Section 9.2 - Amendment Limitations

The following articles may NOT be amended:
- Article II, Section 2.1, Items P-003, P-004 (Phase I/II immutability)
- Article IV (Stateless Architecture) - core architectural principle
- Article VIII (Violation Consequences) - enforcement mechanism

---

## ARTICLE X: DEFINITIONS

| Term | Definition |
|------|------------|
| Agent | Any AI system (Claude, GPT, Gemini) operating on this codebase |
| Artifact | Any file produced as output of a development stage |
| Gate | A checkpoint requiring explicit approval before proceeding |
| MCP | Model Context Protocol - standardized tool interface for AI agents |
| Phase II | The completed Full-Stack Web Application (immutable) |
| Phase III | The AI-Powered Todo Chatbot (current scope) |
| Spec | A specification document defining WHAT to build |
| Stateless | Server holds no request-specific data between requests |
| Task ID | Unique identifier (T-XXX) linking code to approved task |
| User | The human operator with authority to approve gates |

---

## RATIFICATION

This Constitution is effective immediately upon creation.

All AI agents reading this document are bound by its terms.

**Any agent that proceeds with implementation without following this Constitution is in violation and must halt immediately.**

---

*End of Constitution*

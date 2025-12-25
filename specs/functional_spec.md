# Functional Specification: Phase 1 In-Memory Todo CLI Application

**Version:** 1.0  
**Date:** December 26, 2025  
**Status:** Draft  
**Target Audience:** Developers, Stakeholders, QA

---

## 1. Executive Summary

This document defines the functional requirements for a Phase 1 In-Memory Todo CLI Application. The application is designed as a beginner-friendly, console-based task management tool that operates entirely in memory without any database or file persistence.

### 1.1 Purpose
- Provide a simple task management interface via command-line
- Demonstrate clean architecture principles
- Serve as a foundation for future phases with persistence

### 1.2 Scope
**In Scope:**
- Creating, reading, updating, and deleting tasks
- Marking tasks as complete or incomplete
- Console-based user interaction
- In-memory data storage

**Out of Scope:**
- Database integration
- File-based persistence
- Web interface
- Multi-user support
- Task prioritization
- Due dates or reminders
- Task categories or tags

---

## 2. User Stories

### US-001: Add Task
**As a** user  
**I want to** add a new task with a title and description  
**So that** I can track things I need to do

**Acceptance Criteria:**
- User can provide a task title (required)
- User can provide a task description (optional)
- System assigns a unique ID to each task
- New tasks default to "pending" status
- System confirms task creation with the assigned ID

### US-002: List Tasks
**As a** user  
**I want to** view all my tasks with their current status  
**So that** I can see what needs to be done

**Acceptance Criteria:**
- System displays all tasks in a readable format
- Each task shows: ID, title, description, and status
- Status is clearly marked as "completed" or "pending"
- Empty list shows appropriate message
- Tasks are displayed in order of creation (oldest first)

### US-003: Update Task
**As a** user  
**I want to** update a task's title or description  
**So that** I can correct mistakes or add more information

**Acceptance Criteria:**
- User can update task title
- User can update task description
- User can update both title and description in one operation
- System validates that task ID exists
- System confirms successful update
- At least one field (title or description) must be provided

### US-004: Delete Task
**As a** user  
**I want to** delete a task by its ID  
**So that** I can remove tasks I no longer need

**Acceptance Criteria:**
- User can delete a task by providing its ID
- System validates that task ID exists
- System confirms successful deletion
- Deleted tasks are removed from the list

### US-005: Mark Task Complete
**As a** user  
**I want to** mark a task as complete  
**So that** I can track my progress

**Acceptance Criteria:**
- User can mark a pending task as complete
- Status changes from "pending" to "completed"
- System confirms status change
- Already completed tasks can be marked complete (idempotent)

### US-006: Mark Task Incomplete
**As a** user  
**I want to** mark a task as incomplete  
**So that** I can reopen tasks if needed

**Acceptance Criteria:**
- User can mark a completed task as incomplete
- Status changes from "completed" to "pending"
- System confirms status change
- Already pending tasks can be marked incomplete (idempotent)

---

## 3. Functional Requirements

### 3.1 Task Entity

**FR-001: Task Structure**
- Each task must have the following attributes:
  - `id`: Integer, unique, auto-generated, immutable
  - `title`: String, required, 1-200 characters
  - `description`: String, optional, 0-1000 characters
  - `status`: Enum, either "pending" or "completed"
  - `created_at`: Timestamp, auto-generated, immutable

**FR-002: Task ID Generation**
- IDs must be unique integers
- IDs must be sequential starting from 1
- IDs must persist for the session lifetime
- Deleted task IDs should not be reused in the same session

### 3.2 Commands

**FR-003: Add Task Command**
- Command: `add` or equivalent
- Required input: title
- Optional input: description
- Output: Confirmation with assigned task ID
- Validation: Title cannot be empty or whitespace-only

**FR-004: List Tasks Command**
- Command: `list` or equivalent
- Input: None required
- Output: Formatted list of all tasks
- Empty state: "No tasks found" or similar message
- Format must include: ID, title, description (truncated if long), status

**FR-005: Update Task Command**
- Command: `update` or equivalent
- Required input: task ID
- Optional inputs: new title, new description (at least one required)
- Output: Confirmation of update
- Validation: Task ID must exist
- Validation: At least one field to update must be provided

**FR-006: Delete Task Command**
- Command: `delete` or equivalent
- Required input: task ID
- Output: Confirmation of deletion
- Validation: Task ID must exist

**FR-007: Complete Task Command**
- Command: `complete` or equivalent
- Required input: task ID
- Output: Confirmation of status change
- Validation: Task ID must exist
- Effect: Sets status to "completed"

**FR-008: Uncomplete Task Command**
- Command: `uncomplete` or `incomplete` or equivalent
- Required input: task ID
- Output: Confirmation of status change
- Validation: Task ID must exist
- Effect: Sets status to "pending"

### 3.3 User Interface

**FR-009: Command Prompt**
- Application must display a command prompt
- Prompt should indicate readiness for input
- Prompt format: `todo> ` or similar

**FR-010: Help System**
- Command: `help` or `?`
- Output: List of available commands with brief descriptions
- Available at any time

**FR-011: Exit Command**
- Command: `exit`, `quit`, or `q`
- Action: Gracefully terminate the application
- Warning: May inform user that data will be lost (since in-memory)

**FR-012: Error Messages**
- All errors must display clear, helpful messages
- Invalid commands show available commands
- Invalid task IDs indicate the ID was not found
- Validation errors explain what went wrong

**FR-013: Success Messages**
- All successful operations display confirmation
- Confirmations include relevant details (e.g., task ID, new status)

---

## 4. Data Requirements

### 4.1 Storage

**DR-001: In-Memory Storage**
- All data stored in application memory only
- Data persists only during application runtime
- Data is lost when application exits
- No file system or database interaction

**DR-002: Data Structure**
- Use appropriate Python data structures (list, dict)
- Optimize for fast lookup by ID
- Support iteration for listing all tasks

### 4.2 Data Validation

**DV-001: Title Validation**
- Cannot be empty string
- Cannot be only whitespace
- Maximum length: 200 characters
- Must be string type

**DV-002: Description Validation**
- Can be empty string
- Maximum length: 1000 characters
- Must be string type if provided

**DV-003: ID Validation**
- Must be positive integer
- Must exist in current task list
- Auto-generated, not user-provided for creation

**DV-004: Status Validation**
- Must be either "pending" or "completed"
- Only these two values allowed
- Case-insensitive when displayed, normalized internally

---

## 5. User Interface Flow

### 5.1 Application Startup
1. Application displays welcome message
2. Application displays available commands or help hint
3. Application displays command prompt

### 5.2 Command Execution Flow
1. User enters command
2. Application parses command
3. Application validates input
4. If invalid: display error, return to prompt
5. If valid: execute command
6. Display result/confirmation
7. Return to prompt

### 5.3 Application Exit
1. User enters exit command
2. Application displays goodbye message
3. Application terminates cleanly

---

## 6. Examples and Use Cases

### 6.1 Example Session

```
Welcome to Todo CLI!
Type 'help' for available commands.

todo> add "Buy groceries" "Milk, eggs, bread"
✓ Task created with ID: 1

todo> add "Call dentist"
✓ Task created with ID: 2

todo> list
ID | Title          | Description      | Status
---+----------------+------------------+---------
1  | Buy groceries  | Milk, eggs, br.. | pending
2  | Call dentist   |                  | pending

todo> complete 1
✓ Task 1 marked as completed

todo> list
ID | Title          | Description      | Status
---+----------------+------------------+-----------
1  | Buy groceries  | Milk, eggs, br.. | completed
2  | Call dentist   |                  | pending

todo> update 2 --title "Schedule dentist appointment"
✓ Task 2 updated

todo> delete 1
✓ Task 1 deleted

todo> list
ID | Title                          | Description | Status
---+--------------------------------+-------------+---------
2  | Schedule dentist appointment   |             | pending

todo> exit
Goodbye! All data has been cleared.
```

### 6.2 Error Handling Examples

```
todo> add
✗ Error: Title is required

todo> delete 999
✗ Error: Task with ID 999 not found

todo> update 1
✗ Error: At least one field (title or description) must be provided

todo> invalidcommand
✗ Error: Unknown command 'invalidcommand'. Type 'help' for available commands.
```

---

## 7. Non-Functional Requirements

### 7.1 Usability
- **NFR-001:** Commands should be intuitive and easy to remember
- **NFR-002:** Error messages must be clear and actionable
- **NFR-003:** Application should respond immediately (< 100ms for all operations)

### 7.2 Reliability
- **NFR-004:** Application should not crash on invalid input
- **NFR-005:** All commands should be idempotent where appropriate

### 7.3 Maintainability
- **NFR-006:** Code should follow clean architecture principles
- **NFR-007:** Code should be well-documented
- **NFR-008:** Code should be beginner-friendly and readable

### 7.4 Compatibility
- **NFR-009:** Must run on Python 3.13+
- **NFR-010:** Must work on Windows, macOS, and Linux
- **NFR-011:** Should use UV for dependency management

---

## 8. Future Considerations (Phase 2+)

Items intentionally excluded from Phase 1 but may be considered for future phases:

1. **Persistence:** File-based or database storage
2. **Search:** Filter tasks by title, description, or status
3. **Priority:** High/medium/low priority levels
4. **Due Dates:** Task deadlines and reminders
5. **Categories:** Organize tasks by project or category
6. **Export:** Export tasks to JSON, CSV, or other formats
7. **Import:** Import tasks from external sources
8. **Undo/Redo:** Command history and rollback
9. **Task Dependencies:** Link related tasks
10. **Recurring Tasks:** Tasks that repeat on a schedule

---

## 9. Acceptance Criteria

The Phase 1 application is considered complete when:

1. All user stories (US-001 through US-006) are implemented
2. All functional requirements (FR-001 through FR-013) are met
3. All data requirements (DR-001 through DV-004) are satisfied
4. All non-functional requirements (NFR-001 through NFR-011) are achieved
5. Application runs without crashes on valid and invalid input
6. All commands work as specified in the examples
7. Code follows clean architecture principles
8. README and documentation are complete

---

## 10. Glossary

- **Task:** A single item representing something to be done
- **Status:** The current state of a task (pending or completed)
- **CLI:** Command-Line Interface
- **In-Memory:** Data stored in RAM, not persisted to disk
- **Idempotent:** Operation that produces the same result regardless of how many times it's executed

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-26 | System | Initial draft |

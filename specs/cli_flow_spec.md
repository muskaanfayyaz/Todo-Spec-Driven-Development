# CLI Interaction Flow Specification: Phase 1 In-Memory Todo CLI

**Version:** 1.0  
**Date:** December 26, 2025  
**Status:** Draft  
**Target Audience:** Developers, UX Designers, QA

---

## 1. Overview

This document specifies the exact user interface flows, command syntax, output formatting, and interaction patterns for the Todo CLI application. It serves as the definitive guide for how users interact with the system.

---

## 2. Application Lifecycle

### 2.1 Startup Sequence

```
┌─────────────────────────────────────────────────────┐
│ Step 1: Display Welcome Banner                      │
└─────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────┐
│ Step 2: Show Quick Help or Hint                     │
└─────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────┐
│ Step 3: Display Command Prompt                      │
└─────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────┐
│ Step 4: Enter Main Loop (REPL)                      │
└─────────────────────────────────────────────────────┘
```

**Startup Output:**
```
╔════════════════════════════════════════════════════╗
║            Welcome to Todo CLI v1.0!               ║
║        Your simple in-memory task manager          ║
╚════════════════════════════════════════════════════╝

Type 'help' to see available commands.
Type 'exit' to quit.

todo>
```

### 2.2 Main Loop (REPL)

```
┌─────────────────────────────────────────────────────┐
│ 1. Display Prompt                                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 2. Wait for User Input                              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 3. Parse Command and Arguments                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 4. Validate Input                                   │
└──────┬──────────────────────────────────────┬───────┘
       │                                      │
   Valid │                                Invalid │
       │                                      │
       ▼                                      ▼
┌──────────────────┐              ┌─────────────────────┐
│ 5a. Execute      │              │ 5b. Display Error   │
│     Command      │              │     Message         │
└────┬─────────────┘              └─────┬───────────────┘
     │                                   │
     ▼                                   │
┌──────────────────┐                     │
│ 6a. Display      │                     │
│     Result       │                     │
└────┬─────────────┘                     │
     │                                   │
     └───────────────┬───────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ 7. Return to Step 1 (unless exit command)           │
└─────────────────────────────────────────────────────┘
```

### 2.3 Shutdown Sequence

```
┌─────────────────────────────────────────────────────┐
│ Step 1: User Issues 'exit' Command                  │
└─────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────┐
│ Step 2: Display Goodbye Message                     │
└─────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────┐
│ Step 3: Clear In-Memory Data                        │
└─────────────────────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────────────────────┐
│ Step 4: Terminate Application (exit code 0)         │
└─────────────────────────────────────────────────────┘
```

**Shutdown Output:**
```
todo> exit

Thanks for using Todo CLI!
All data has been cleared from memory.
Goodbye!
```

---

## 3. Command Reference

### 3.1 Command Syntax Notation

- `<required>`: Required parameter
- `[optional]`: Optional parameter
- `|`: Alternative options
- `"text"`: String that may contain spaces

### 3.2 Command Index

| Command | Aliases | Purpose |
|---------|---------|---------|
| `help` | `?`, `h` | Display available commands |
| `add` | `create`, `new` | Add a new task |
| `list` | `ls`, `all` | List all tasks |
| `update` | `edit`, `modify` | Update a task |
| `delete` | `remove`, `rm` | Delete a task |
| `complete` | `done`, `finish` | Mark task as completed |
| `uncomplete` | `incomplete`, `undo` | Mark task as pending |
| `exit` | `quit`, `q` | Exit the application |

---

## 4. Detailed Command Flows

### 4.1 HELP Command

**Syntax:**
```
help
```

**Aliases:** `?`, `h`

**Flow:**
```
User Input: help
    │
    ▼
Parse: No arguments needed
    │
    ▼
Execute: Retrieve help text
    │
    ▼
Display: Formatted command list
```

**Output:**
```
todo> help

Available Commands:

  add <title> [description]
      Create a new task with a title and optional description
      Example: add "Buy milk" "From the grocery store"

  list
      Display all tasks with their status
      Aliases: ls, all

  update <id> [--title <new_title>] [--description <new_desc>]
      Update a task's title and/or description
      Example: update 1 --title "Buy groceries"

  delete <id>
      Delete a task by its ID
      Aliases: remove, rm

  complete <id>
      Mark a task as completed
      Aliases: done, finish

  uncomplete <id>
      Mark a task as pending (not completed)
      Aliases: incomplete, undo

  help
      Show this help message
      Aliases: ?, h

  exit
      Exit the application
      Aliases: quit, q

For more examples, visit: [documentation URL if available]

todo>
```

---

### 4.2 ADD Command

**Syntax:**
```
add <title> [description]
```

**Aliases:** `create`, `new`

**Parameters:**
- `<title>`: Required, 1-200 characters
- `[description]`: Optional, 0-1000 characters

**Flow:**
```
User Input: add "Buy milk" "From the store"
    │
    ▼
Parse: Extract title and description
    │
    ▼
Validate:
    - Title not empty? ──No──▶ Error: "Title required"
    - Title length OK? ─No──▶ Error: "Title too long"
    - Desc length OK? ──No──▶ Error: "Description too long"
    │
   Yes (all validations passed)
    │
    ▼
Execute:
    - Create Task entity
    - Generate unique ID
    - Set status to PENDING
    - Store in repository
    │
    ▼
Display: Success with task ID
```

**Successful Output:**
```
todo> add "Buy milk" "From the grocery store"

✓ Task created successfully!

  ID: 1
  Title: Buy milk
  Description: From the grocery store
  Status: pending
  Created: 2025-12-26 14:30:45

todo>
```

**Error Outputs:**

*Empty title:*
```
todo> add

✗ Error: Title is required
  Use: add <title> [description]

todo>
```

*Title too long:*
```
todo> add "This is an extremely long title that exceeds the maximum allowed length of 200 characters and will be rejected by the validation logic because it's just too long to be a reasonable task title..."

✗ Error: Title exceeds maximum length of 200 characters

todo>
```

**Edge Cases:**
```
# Description only (should fail)
todo> add "" "Some description"
✗ Error: Title is required

# Special characters in title (should work)
todo> add "Email John @ work" "Re: Q4 report"
✓ Task created successfully!
  ID: 1
  ...

# Very long description (should fail if > 1000 chars)
todo> add "Title" "Description that is longer than 1000 characters..."
✗ Error: Description exceeds maximum length of 1000 characters
```

---

### 4.3 LIST Command

**Syntax:**
```
list
```

**Aliases:** `ls`, `all`

**Parameters:** None

**Flow:**
```
User Input: list
    │
    ▼
Parse: No arguments
    │
    ▼
Execute: Retrieve all tasks from repository
    │
    ▼
Check: Any tasks exist?
    │
    ├─No──▶ Display: "No tasks found"
    │
   Yes
    │
    ▼
Format: Create table with tasks
    │
    ▼
Display: Formatted table
```

**Output with Tasks:**
```
todo> list

┌────┬────────────────────┬──────────────────────┬───────────┐
│ ID │ Title              │ Description          │ Status    │
├────┼────────────────────┼──────────────────────┼───────────┤
│ 1  │ Buy milk           │ From the grocery ... │ pending   │
│ 2  │ Call dentist       │                      │ pending   │
│ 3  │ Finish project     │ Due Friday           │ completed │
│ 4  │ Read book          │ "Clean Code" by M... │ pending   │
└────┴────────────────────┴──────────────────────┴───────────┘

Total: 4 tasks (3 pending, 1 completed)

todo>
```

**Output with No Tasks:**
```
todo> list

No tasks found.
Use 'add' command to create your first task!

todo>
```

**Formatting Rules:**
- Description truncated to 20 chars with "..." if longer
- Status displayed as "pending" or "completed"
- Tasks ordered by ID (creation order)
- Column widths adjusted for readability
- Summary line shows total and status breakdown

---

### 4.4 UPDATE Command

**Syntax:**
```
update <id> [--title <new_title>] [--description <new_description>]
```

**Aliases:** `edit`, `modify`

**Parameters:**
- `<id>`: Required, task ID (integer)
- `--title`: Optional, new title
- `--description`: Optional, new description
- At least one of `--title` or `--description` must be provided

**Flow:**
```
User Input: update 1 --title "Buy groceries"
    │
    ▼
Parse: Extract ID and field updates
    │
    ▼
Validate:
    - ID is integer? ───No──▶ Error: "Invalid ID"
    - At least one field? ─No──▶ Error: "No fields to update"
    - Field lengths OK? ───No──▶ Error: "Value too long"
    │
   Yes
    │
    ▼
Execute:
    - Retrieve task by ID
    - Task exists? ────No──▶ Error: "Task not found"
    - Update specified fields
    - Save to repository
    │
   Yes
    │
    ▼
Display: Success with updated task
```

**Successful Outputs:**

*Update title only:*
```
todo> update 1 --title "Buy groceries"

✓ Task 1 updated successfully!

  ID: 1
  Title: Buy groceries (changed)
  Description: From the grocery store
  Status: pending

todo>
```

*Update description only:*
```
todo> update 1 --description "Milk, eggs, bread"

✓ Task 1 updated successfully!

  ID: 1
  Title: Buy milk
  Description: Milk, eggs, bread (changed)
  Status: pending

todo>
```

*Update both:*
```
todo> update 1 --title "Buy groceries" --description "Milk, eggs, bread"

✓ Task 1 updated successfully!

  ID: 1
  Title: Buy groceries (changed)
  Description: Milk, eggs, bread (changed)
  Status: pending

todo>
```

**Error Outputs:**

*Task not found:*
```
todo> update 999 --title "New title"

✗ Error: Task with ID 999 not found
  Use 'list' to see available tasks

todo>
```

*No fields provided:*
```
todo> update 1

✗ Error: At least one field must be provided
  Use: update <id> [--title <title>] [--description <desc>]

todo>
```

*Invalid ID:*
```
todo> update abc --title "New title"

✗ Error: Invalid task ID 'abc'
  Task ID must be a number

todo>
```

---

### 4.5 DELETE Command

**Syntax:**
```
delete <id>
```

**Aliases:** `remove`, `rm`

**Parameters:**
- `<id>`: Required, task ID (integer)

**Flow:**
```
User Input: delete 1
    │
    ▼
Parse: Extract task ID
    │
    ▼
Validate:
    - ID is integer? ──No──▶ Error: "Invalid ID"
    │
   Yes
    │
    ▼
Execute:
    - Check if task exists
    - Task exists? ────No──▶ Error: "Task not found"
    - Delete from repository
    │
   Yes
    │
    ▼
Display: Success confirmation
```

**Successful Output:**
```
todo> delete 1

✓ Task 1 deleted successfully!

  Deleted task: "Buy milk"

todo>
```

**Error Outputs:**

*Task not found:*
```
todo> delete 999

✗ Error: Task with ID 999 not found
  Use 'list' to see available tasks

todo>
```

*Invalid ID:*
```
todo> delete abc

✗ Error: Invalid task ID 'abc'
  Task ID must be a number

todo>
```

---

### 4.6 COMPLETE Command

**Syntax:**
```
complete <id>
```

**Aliases:** `done`, `finish`

**Parameters:**
- `<id>`: Required, task ID (integer)

**Flow:**
```
User Input: complete 1
    │
    ▼
Parse: Extract task ID
    │
    ▼
Validate:
    - ID is integer? ──No──▶ Error: "Invalid ID"
    │
   Yes
    │
    ▼
Execute:
    - Retrieve task by ID
    - Task exists? ────No──▶ Error: "Task not found"
    - Mark as completed
    - Save to repository
    │
   Yes
    │
    ▼
Display: Success confirmation
```

**Successful Output:**
```
todo> complete 1

✓ Task 1 marked as completed!

  Title: Buy milk
  Status: pending → completed

todo>
```

**Already Completed (Idempotent):**
```
todo> complete 1

✓ Task 1 is already completed

  Title: Buy milk
  Status: completed

todo>
```

**Error Outputs:**

*Task not found:*
```
todo> complete 999

✗ Error: Task with ID 999 not found
  Use 'list' to see available tasks

todo>
```

---

### 4.7 UNCOMPLETE Command

**Syntax:**
```
uncomplete <id>
```

**Aliases:** `incomplete`, `undo`

**Parameters:**
- `<id>`: Required, task ID (integer)

**Flow:**
```
User Input: uncomplete 1
    │
    ▼
Parse: Extract task ID
    │
    ▼
Validate:
    - ID is integer? ──No──▶ Error: "Invalid ID"
    │
   Yes
    │
    ▼
Execute:
    - Retrieve task by ID
    - Task exists? ────No──▶ Error: "Task not found"
    - Mark as pending
    - Save to repository
    │
   Yes
    │
    ▼
Display: Success confirmation
```

**Successful Output:**
```
todo> uncomplete 1

✓ Task 1 marked as pending!

  Title: Buy milk
  Status: completed → pending

todo>
```

**Already Pending (Idempotent):**
```
todo> uncomplete 1

✓ Task 1 is already pending

  Title: Buy milk
  Status: pending

todo>
```

---

### 4.8 EXIT Command

**Syntax:**
```
exit
```

**Aliases:** `quit`, `q`

**Parameters:** None

**Flow:**
```
User Input: exit
    │
    ▼
Parse: No arguments
    │
    ▼
Execute:
    - Display goodbye message
    - Clear in-memory data
    - Set exit flag
    │
    ▼
Terminate: Exit main loop with code 0
```

**Output:**
```
todo> exit

╔════════════════════════════════════════════════════╗
║          Thanks for using Todo CLI!                ║
╚════════════════════════════════════════════════════╝

All data has been cleared from memory.
Goodbye! 👋

[Application terminates]
```

---

## 5. Input Parsing Rules

### 5.1 Command Format

**General Pattern:**
```
<command> [arguments]
```

**Rules:**
1. Commands are case-insensitive: `add` = `ADD` = `Add`
2. Leading/trailing whitespace is ignored
3. Multiple spaces between arguments treated as single space
4. Empty input (just Enter) re-displays prompt

### 5.2 String Arguments

**With Quotes:**
```
add "Buy milk" "From the store"
```
- Anything between quotes is a single argument
- Supports spaces, special characters
- Both single `'` and double `"` quotes supported

**Without Quotes:**
```
add Buy milk
```
- First word after command is argument
- Spaces separate arguments
- Use for single-word arguments

### 5.3 Flags and Options

**Format:**
```
update 1 --title "New title" --description "New desc"
```

**Rules:**
1. Flags start with `--`
2. Flag name followed by value
3. Order doesn't matter
4. Can be combined or used separately

### 5.4 Error Recovery

**Unknown Command:**
```
todo> invalidcommand

✗ Error: Unknown command 'invalidcommand'

Did you mean?
  • add - Create a new task
  • list - Display all tasks

Type 'help' for all available commands.

todo>
```

**Syntax Error:**
```
todo> update 1 --invalid

✗ Error: Unknown option '--invalid'
  Valid options: --title, --description

todo>
```

---

## 6. Output Formatting

### 6.1 Success Messages

**Format:**
```
✓ [Action] [successful/completed]!

  [Details]

todo>
```

**Characteristics:**
- Green checkmark (✓) or equivalent
- Clear action statement
- Details indented below
- Blank line before prompt

### 6.2 Error Messages

**Format:**
```
✗ Error: [Brief description]
  [Additional context or suggestion]

todo>
```

**Characteristics:**
- Red X (✗) or equivalent
- "Error:" prefix
- Helpful context or suggestion
- Blank line before prompt

### 6.3 Table Formatting

**Guidelines:**
- Box-drawing characters for borders
- Column headers in bold (if terminal supports)
- Minimum column widths for readability
- Text truncation with "..." for long content
- Right-align numeric columns (ID)
- Left-align text columns

**Example:**
```
┌────┬────────────────────┬──────────────────────┬───────────┐
│ ID │ Title              │ Description          │ Status    │
├────┼────────────────────┼──────────────────────┼───────────┤
│ 1  │ Buy milk           │ From the store       │ pending   │
└────┴────────────────────┴──────────────────────┴───────────┘
```

### 6.4 Text Truncation

**Rules:**
- Title: Show first 20 chars + "..." if longer
- Description: Show first 20 chars + "..." if longer
- In detail views: Show full text, wrap if needed

**Example:**
```
Short: "Buy milk"          → "Buy milk"
Long:  "Buy milk and eggs" → "Buy milk and eggs"
Very:  "This is a very long title that exceeds..." 
                           → "This is a very lon..."
```

---

## 7. Complete User Session Examples

### 7.1 First-Time User Session

```
╔════════════════════════════════════════════════════╗
║            Welcome to Todo CLI v1.0!               ║
║        Your simple in-memory task manager          ║
╚════════════════════════════════════════════════════╝

Type 'help' to see available commands.
Type 'exit' to quit.

todo> help

[... help output ...]

todo> list

No tasks found.
Use 'add' command to create your first task!

todo> add "Buy groceries" "Milk, eggs, bread, cheese"

✓ Task created successfully!

  ID: 1
  Title: Buy groceries
  Description: Milk, eggs, bread, cheese
  Status: pending
  Created: 2025-12-26 14:35:22

todo> add "Call dentist"

✓ Task created successfully!

  ID: 2
  Title: Call dentist
  Description: 
  Status: pending
  Created: 2025-12-26 14:35:45

todo> add "Finish report" "Q4 sales analysis"

✓ Task created successfully!

  ID: 3
  Title: Finish report
  Description: Q4 sales analysis
  Status: pending
  Created: 2025-12-26 14:36:01

todo> list

┌────┬────────────────────┬──────────────────────┬───────────┐
│ ID │ Title              │ Description          │ Status    │
├────┼────────────────────┼──────────────────────┼───────────┤
│ 1  │ Buy groceries      │ Milk, eggs, bread... │ pending   │
│ 2  │ Call dentist       │                      │ pending   │
│ 3  │ Finish report      │ Q4 sales analysis    │ pending   │
└────┴────────────────────┴──────────────────────┴───────────┘

Total: 3 tasks (3 pending, 0 completed)

todo> complete 1

✓ Task 1 marked as completed!

  Title: Buy groceries
  Status: pending → completed

todo> list

┌────┬────────────────────┬──────────────────────┬───────────┐
│ ID │ Title              │ Description          │ Status    │
├────┼────────────────────┼──────────────────────┼───────────┤
│ 1  │ Buy groceries      │ Milk, eggs, bread... │ completed │
│ 2  │ Call dentist       │                      │ pending   │
│ 3  │ Finish report      │ Q4 sales analysis    │ pending   │
└────┴────────────────────┴──────────────────────┴───────────┘

Total: 3 tasks (2 pending, 1 completed)

todo> exit

╔════════════════════════════════════════════════════╗
║          Thanks for using Todo CLI!                ║
╚════════════════════════════════════════════════════╝

All data has been cleared from memory.
Goodbye! 👋
```

### 7.2 Error Handling Session

```
todo> add

✗ Error: Title is required
  Use: add <title> [description]

todo> delete abc

✗ Error: Invalid task ID 'abc'
  Task ID must be a number

todo> update 999 --title "New"

✗ Error: Task with ID 999 not found
  Use 'list' to see available tasks

todo> update 1

✗ Error: At least one field must be provided
  Use: update <id> [--title <title>] [--description <desc>]

todo> randomcommand

✗ Error: Unknown command 'randomcommand'

Did you mean?
  • add - Create a new task
  • list - Display all tasks

Type 'help' for all available commands.

todo>
```

---

## 8. Accessibility Considerations

### 8.1 Screen Reader Support

- All visual symbols have text equivalents
- Table structure announced properly
- Clear status indicators ("pending", "completed")

### 8.2 Color Independence

- Don't rely solely on color for status
- Use symbols: ✓ for success, ✗ for error
- Status shown as text: "pending", "completed"

### 8.3 Keyboard Navigation

- All features accessible via keyboard
- No mouse required
- Standard terminal shortcuts work (Ctrl+C, Ctrl+D)

---

## 9. Performance Expectations

### 9.1 Response Times

| Action | Expected Time | Max Time |
|--------|---------------|----------|
| Display prompt | Immediate | 50ms |
| Add task | < 10ms | 100ms |
| List tasks (100) | < 50ms | 200ms |
| Update task | < 10ms | 100ms |
| Delete task | < 10ms | 100ms |
| Help display | < 10ms | 100ms |

### 9.2 Large Data Sets

**Handling 1000+ tasks:**
- List command may be slow
- Consider pagination in future phases
- Current phase: acceptable to show all

---

## 10. Edge Cases and Special Scenarios

### 10.1 Empty State Handling

**No tasks:**
```
todo> list
No tasks found.
Use 'add' command to create your first task!
```

**After deleting all tasks:**
```
todo> delete 1
✓ Task 1 deleted successfully!

todo> list
No tasks found.
```

### 10.2 Sequential Operations

**Deleting then listing:**
```
todo> delete 1
✓ Task 1 deleted successfully!

todo> list
[Shows remaining tasks, or "No tasks found"]
```

**Multiple completions:**
```
todo> complete 1
✓ Task 1 marked as completed!

todo> complete 1
✓ Task 1 is already completed
```

### 10.3 ID Reuse

**After deletion:**
```
todo> add "Task 1"
✓ Task created with ID: 1

todo> delete 1
✓ Task 1 deleted

todo> add "Task 2"
✓ Task created with ID: 2  ← ID 1 not reused
```

---

## 11. Internationalization (Future)

### 11.1 Current Support

- English only
- UTF-8 encoding
- Supports Unicode in task titles/descriptions

### 11.2 Future Considerations

- Multi-language support
- Localized date formats
- RTL language support

---

## 12. Testing Checklist

### 12.1 Command Testing

- [ ] Help command displays all commands
- [ ] Add command creates task with valid inputs
- [ ] Add command rejects invalid inputs
- [ ] List command shows all tasks
- [ ] List command shows empty state
- [ ] Update command modifies title
- [ ] Update command modifies description
- [ ] Update command modifies both
- [ ] Update command rejects invalid ID
- [ ] Delete command removes task
- [ ] Delete command rejects invalid ID
- [ ] Complete command marks as completed
- [ ] Complete command is idempotent
- [ ] Uncomplete command marks as pending
- [ ] Uncomplete command is idempotent
- [ ] Exit command terminates app

### 12.2 Input Testing

- [ ] Case-insensitive commands work
- [ ] Commands with aliases work
- [ ] Quoted strings preserve spaces
- [ ] Special characters handled correctly
- [ ] Very long inputs handled
- [ ] Empty input handled
- [ ] Invalid commands show helpful error

### 12.3 Output Testing

- [ ] Success messages formatted correctly
- [ ] Error messages clear and helpful
- [ ] Table formatting correct
- [ ] Text truncation works
- [ ] Colors/symbols display correctly
- [ ] No text overflow or wrapping issues

---

## 13. Troubleshooting Guide

### 13.1 Common Issues

**Issue:** Command not recognized
- **Solution:** Check spelling, try `help`

**Issue:** Task ID not found
- **Solution:** Use `list` to see valid IDs

**Issue:** Update command not working
- **Solution:** Ensure at least one `--flag` provided

**Issue:** Can't see full description
- **Solution:** Descriptions truncated in list view (by design)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-26 | System | Initial draft |

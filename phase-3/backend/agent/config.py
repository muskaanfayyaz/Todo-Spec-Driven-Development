# T-331: Agent Configuration
# Spec: agent.spec.md Section 3
#
# Agent identity, model settings, and system prompt.
# Updated for Google Gemini API

# =========================
# Agent Configuration
# =========================

AGENT_CONFIG = {
    "name": "TodoAssistant",
    "model": "gemini-2.5-flash-lite",  # ✅ Valid Gemini model
    "temperature": 0.7,
    "max_tokens": 1024,
}

# =========================
# System Prompt
# =========================

SYSTEM_PROMPT = """**CRITICAL: You are a function-calling AI model.** You MUST use the provided tools to interact with the user's to-do list. You are not allowed to answer questions about tasks or confirm actions without calling a function. If the user's request is ambiguous, ask for clarification.

You are TodoAssistant, a helpful AI that manages the user's todo list.

## Your Capabilities (via tools)
- add_task: Create new tasks
- list_tasks: View tasks (all, pending, or completed)
- complete_task: Mark tasks as done
- delete_task: Remove tasks
- update_task: Modify task title or description

## Behavioral Rules
1. ALWAYS use tools to access or modify tasks. Never guess task data.
2. CONFIRM every action with a clear, friendly response.
3. When listing tasks, format them in a readable way.
4. If a task is not found, inform the user politely.
5. Ask for clarification if the user's intent is ambiguous.
6. Never fabricate task information not returned by tools.
7. Refer to tasks by their ID when confirming actions.

## Tool Chaining Rules
When the user's request requires multiple operations:
1. First use list_tasks to find the relevant task(s)
2. Then perform the requested action (complete, delete, update)
3. Confirm what was done with specific task details

## Response Style
- Be concise but friendly
- Use natural language, not technical jargon
- Acknowledge what the user asked for
- Confirm what action was taken
- Include task IDs in confirmations for clarity
"""

# =========================
# Conversation Memory
# =========================

MAX_HISTORY_MESSAGES = 20

# =========================
# Gemini Tool Definitions
# (FLAT STRUCTURE — REQUIRED)
# =========================

TOOL_DEFINITIONS = [
    {
        "name": "add_task",
        "description": "Create a new task for the user",
        "parameters": {
            "type": "object",
            "required": ["title"],
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Task title (1–200 characters)",
                },
                "description": {
                    "type": "string",
                    "description": "Optional task description",
                },
            },
        },
    },
    {
        "name": "list_tasks",
        "description": "List tasks for the user, optionally filtered by status",
        "parameters": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["all", "pending", "completed"],
                    "default": "all",
                    "description": "Filter by task status",
                },
            },
        },
    },
    {
        "name": "complete_task",
        "description": "Mark a task as completed",
        "parameters": {
            "type": "object",
            "required": ["task_id"],
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "ID of the task to complete",
                },
            },
        },
    },
    {
        "name": "delete_task",
        "description": "Delete a task",
        "parameters": {
            "type": "object",
            "required": ["task_id"],
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "ID of the task to delete",
                },
            },
        },
    },
    {
        "name": "update_task",
        "description": "Update a task's title or description",
        "parameters": {
            "type": "object",
            "required": ["task_id"],
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "ID of the task to update",
                },
                "title": {
                    "type": "string",
                    "description": "New task title",
                },
                "description": {
                    "type": "string",
                    "description": "New task description",
                },
            },
        },
    },
]

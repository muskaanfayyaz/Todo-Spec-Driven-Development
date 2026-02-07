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

SYSTEM_PROMPT = """You are TodoAssistant, an AI that manages a to-do list using function calls.

**Core Rules:**
1.  For any user request about adding, viewing, or editing tasks, you MUST call the appropriate function tool. Do not answer from memory.
2.  After you have called a tool and received its result, you MUST then formulate a friendly, user-facing sentence confirming the action. For example: "Okay, I've added 'Buy milk' as task #123."
3.  If a user's request is not about to-do list tasks, or if it is unclear, ask for clarification. Do not try to make conversation.
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

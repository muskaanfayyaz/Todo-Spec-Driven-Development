# T-327: MCP Module Exports
# Spec: mcp-tools.spec.md Section 2
#
# This module provides MCP tools as an ADAPTER over Phase II task logic.
# All tools delegate to Phase II use cases - no duplicate CRUD logic.
#
# Note: Server module removed to avoid conflict with 'mcp' package.
# Tools are now called directly by the agent executor.

from .tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
)

__all__ = [
    "add_task",
    "list_tasks",
    "complete_task",
    "delete_task",
    "update_task",
]

# T-323: list_tasks MCP Tool
# Spec: mcp-tools.spec.md Section 4.2
#
# Lists tasks by delegating to Phase II ListTasksUseCase.
# This is an ADAPTER - no CRUD logic here, only delegation.

import sys
from pathlib import Path
from typing import Optional, Literal

from ._adapter import (
    get_task_repository,
    format_task_list_item,
    format_error,
)

# Phase II import
_phase2_path = Path(__file__).parent.parent.parent.parent.parent / "phase2" / "backend"
if str(_phase2_path) not in sys.path:
    sys.path.insert(0, str(_phase2_path))

from app.application.use_cases import ListTasksUseCase


async def list_tasks(
    user_id: str,
    status: Optional[Literal["all", "pending", "completed"]] = "all",
) -> dict:
    """
    List tasks for the user with optional status filter.

    ADAPTER PATTERN:
    1. Receives parameters from MCP call
    2. Instantiates Phase II repository (user-scoped)
    3. Delegates to Phase II ListTasksUseCase
    4. Filters by status (app-layer, not in use case)
    5. Returns formatted result

    Args:
        user_id: Authenticated user ID for data isolation
        status: Filter - "all", "pending", or "completed"

    Returns:
        {tasks: [{id, title, description, completed}, ...]} on success
        {error, message} on failure
    """
    try:
        with get_task_repository(user_id) as repository:
            # Delegate to Phase II use case - NO CRUD logic here
            use_case = ListTasksUseCase(repository)
            all_tasks = use_case.execute()

            # Filter by status (adapter-layer logic, not CRUD)
            if status == "pending":
                filtered_tasks = [t for t in all_tasks if not t.status.is_completed()]
            elif status == "completed":
                filtered_tasks = [t for t in all_tasks if t.status.is_completed()]
            else:
                filtered_tasks = all_tasks

            return {
                "tasks": [format_task_list_item(t) for t in filtered_tasks],
            }

    except Exception as e:
        return format_error(
            error_type="internal",
            message="Failed to list tasks",
        )

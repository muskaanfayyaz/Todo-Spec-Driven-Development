# T-325: delete_task MCP Tool
# Spec: mcp-tools.spec.md Section 4.4
#
# Deletes a task by delegating to Phase II DeleteTaskUseCase.
# This is an ADAPTER - no CRUD logic here, only delegation.

import sys
from pathlib import Path

from ._adapter import (
    get_task_repository,
    format_error,
)

# Phase II import
_phase2_path = Path(__file__).parent.parent.parent.parent.parent / "phase2" / "backend"
if str(_phase2_path) not in sys.path:
    sys.path.insert(0, str(_phase2_path))

from app.application.use_cases import DeleteTaskUseCase
from app.domain.exceptions import TaskNotFoundError


async def delete_task(
    user_id: str,
    task_id: int,
) -> dict:
    """
    Delete a task.

    ADAPTER PATTERN:
    1. Receives parameters from MCP call
    2. Instantiates Phase II repository (user-scoped)
    3. Gets task title before deletion (for response)
    4. Delegates to Phase II DeleteTaskUseCase
    5. Returns formatted result

    Args:
        user_id: Authenticated user ID for data isolation
        task_id: ID of the task to delete

    Returns:
        {task_id, status: "deleted", title} on success
        {error, message, task_id} on failure
    """
    try:
        with get_task_repository(user_id) as repository:
            # Get task title before deletion (for response)
            task = repository.get_by_id(task_id)
            if task is None:
                return format_error(
                    error_type="not_found",
                    message=f"Task {task_id} not found",
                    task_id=task_id,
                )

            task_title = task.title

            # Delegate to Phase II use case - NO CRUD logic here
            use_case = DeleteTaskUseCase(repository)
            use_case.execute(task_id=task_id)

            return {
                "task_id": task_id,
                "status": "deleted",
                "title": task_title,
            }

    except TaskNotFoundError:
        return format_error(
            error_type="not_found",
            message=f"Task {task_id} not found",
            task_id=task_id,
        )
    except Exception as e:
        return format_error(
            error_type="internal",
            message="Failed to delete task",
            task_id=task_id,
        )

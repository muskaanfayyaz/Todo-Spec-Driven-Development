# T-324: complete_task MCP Tool
# Spec: mcp-tools.spec.md Section 4.3
#
# Marks a task as completed by delegating to Phase II CompleteTaskUseCase.
# This is an ADAPTER - no CRUD logic here, only delegation.

import sys
from pathlib import Path

from ._adapter import (
    get_task_repository,
    format_task_result,
    format_error,
)

# Phase II import
_phase2_path = Path(__file__).parent.parent.parent.parent.parent / "phase2" / "backend"
if str(_phase2_path) not in sys.path:
    sys.path.insert(0, str(_phase2_path))

from app.application.use_cases import CompleteTaskUseCase
from app.domain.exceptions import TaskNotFoundError


async def complete_task(
    user_id: str,
    task_id: int,
) -> dict:
    """
    Mark a task as completed.

    ADAPTER PATTERN:
    1. Receives parameters from MCP call
    2. Instantiates Phase II repository (user-scoped)
    3. Delegates to Phase II CompleteTaskUseCase
    4. Returns formatted result

    Args:
        user_id: Authenticated user ID for data isolation
        task_id: ID of the task to mark as completed

    Returns:
        {task_id, status: "completed", title} on success
        {error, message, task_id} on failure
    """
    try:
        with get_task_repository(user_id) as repository:
            # Delegate to Phase II use case - NO CRUD logic here
            use_case = CompleteTaskUseCase(repository)
            task = use_case.execute(task_id=task_id)

            return format_task_result(task, status="completed")

    except TaskNotFoundError:
        return format_error(
            error_type="not_found",
            message=f"Task {task_id} not found",
            task_id=task_id,
        )
    except Exception as e:
        return format_error(
            error_type="internal",
            message="Failed to complete task",
            task_id=task_id,
        )

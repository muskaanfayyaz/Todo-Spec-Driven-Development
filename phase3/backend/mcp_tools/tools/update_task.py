# T-326: update_task MCP Tool
# Spec: mcp-tools.spec.md Section 4.5
#
# Updates a task by delegating to Phase II UpdateTaskUseCase.
# This is an ADAPTER - no CRUD logic here, only delegation.

import sys
from pathlib import Path
from typing import Optional

from ._adapter import (
    get_task_repository,
    format_task_result,
    format_error,
)

# Phase II import
_phase2_path = Path(__file__).parent.parent.parent.parent.parent / "phase2" / "backend"
if str(_phase2_path) not in sys.path:
    sys.path.insert(0, str(_phase2_path))

from app.application.use_cases import UpdateTaskUseCase
from app.domain.exceptions import TaskNotFoundError, TaskValidationError


async def update_task(
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
) -> dict:
    """
    Update a task's title or description.

    ADAPTER PATTERN:
    1. Receives parameters from MCP call
    2. Validates at least one field to update
    3. Instantiates Phase II repository (user-scoped)
    4. Delegates to Phase II UpdateTaskUseCase
    5. Returns formatted result

    Args:
        user_id: Authenticated user ID for data isolation
        task_id: ID of the task to update
        title: New title (optional, 1-200 chars)
        description: New description (optional, max 1000 chars)

    Returns:
        {task_id, status: "updated", title} on success
        {error, message, task_id} on failure
    """
    # Validation: at least one field required
    if title is None and description is None:
        return format_error(
            error_type="validation",
            message="At least one of title or description must be provided",
            task_id=task_id,
        )

    try:
        with get_task_repository(user_id) as repository:
            # Delegate to Phase II use case - NO CRUD logic here
            use_case = UpdateTaskUseCase(repository)
            task = use_case.execute(
                task_id=task_id,
                title=title,
                description=description,
            )

            return format_task_result(task, status="updated")

    except TaskNotFoundError:
        return format_error(
            error_type="not_found",
            message=f"Task {task_id} not found",
            task_id=task_id,
        )
    except TaskValidationError as e:
        return format_error(
            error_type="validation",
            message=str(e),
            task_id=task_id,
        )
    except Exception as e:
        return format_error(
            error_type="internal",
            message="Failed to update task",
            task_id=task_id,
        )

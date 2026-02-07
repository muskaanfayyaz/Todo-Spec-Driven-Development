# T-322: add_task MCP Tool
# Spec: mcp-tools.spec.md Section 4.1
#
# Creates a new task by delegating to Phase II AddTaskUseCase.
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

from app.application.use_cases import AddTaskUseCase
from app.domain.exceptions import TaskValidationError


async def add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
) -> dict:
    """
    Create a new task for the user.

    ADAPTER PATTERN:
    1. Receives parameters from MCP call
    2. Instantiates Phase II repository (user-scoped)
    3. Delegates to Phase II AddTaskUseCase
    4. Returns formatted result

    Args:
        user_id: Authenticated user ID for data isolation
        title: Task title (1-200 chars)
        description: Optional task description (max 1000 chars)

    Returns:
        {task_id, status: "created", title} on success
        {error, message} on failure
    """
    try:
        with get_task_repository(user_id) as repository:
            # Delegate to Phase II use case - NO CRUD logic here
            use_case = AddTaskUseCase(repository)
            task = use_case.execute(
                title=title,
                description=description or "",
            )

            return format_task_result(task, status="created")

    except TaskValidationError as e:
        return format_error(
            error_type="validation",
            message=str(e),
            title=title,
        )
    except Exception as e:
        return format_error(
            error_type="internal",
            message="Failed to create task",
        )

# MCP Tools Adapter Base
# Spec: mcp-tools.spec.md Section 3 (Phase II Delegation)
#
# This module provides the adapter pattern for connecting MCP tools to Phase II.
# It handles session management and repository instantiation.

import sys
from pathlib import Path
from contextlib import contextmanager
from typing import Generator

# Add phase2 to path for imports
# This allows importing Phase II modules without modifying them
_phase2_path = Path(__file__).parent.parent.parent.parent.parent / "phase2" / "backend"
if str(_phase2_path) not in sys.path:
    sys.path.insert(0, str(_phase2_path))

# Phase II imports (READ-ONLY usage)
from sqlmodel import Session
from app.database import engine
from app.infrastructure.repositories import PostgreSQLTaskRepository
from app.domain.exceptions import TaskNotFoundError, TaskValidationError


@contextmanager
def get_task_repository(user_id: str) -> Generator[PostgreSQLTaskRepository, None, None]:
    """
    Context manager that provides a user-scoped task repository.

    This is the ADAPTER pattern - we create a Phase II repository
    with proper user isolation, then yield it for use case execution.

    Args:
        user_id: Authenticated user ID for data isolation

    Yields:
        PostgreSQLTaskRepository scoped to the user

    Example:
        with get_task_repository("user_123") as repo:
            use_case = ListTasksUseCase(repo)
            tasks = use_case.execute()
    """
    with Session(engine) as session:
        repository = PostgreSQLTaskRepository(session, user_id)
        yield repository
        session.commit()


def format_task_result(task, status: str) -> dict:
    """
    Format a Phase II Task domain object into MCP tool result.

    Args:
        task: Phase II Task domain entity
        status: Operation status ("created", "completed", "updated", "deleted")

    Returns:
        Dict matching mcp-tools.spec.md response format
    """
    return {
        "task_id": task.id,
        "status": status,
        "title": task.title,
    }


def format_task_list_item(task) -> dict:
    """
    Format a Phase II Task for list_tasks response.

    Args:
        task: Phase II Task domain entity

    Returns:
        Dict with id, title, description, completed
    """
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description or "",
        "completed": task.status.is_completed(),
    }


def format_error(error_type: str, message: str, **extra) -> dict:
    """
    Format an error response for MCP tool.

    Args:
        error_type: Type of error (e.g., "not_found", "validation")
        message: Human-readable error message
        **extra: Additional error context

    Returns:
        Dict with error information
    """
    return {
        "error": error_type,
        "message": message,
        **extra,
    }

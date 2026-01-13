"""
Task CRUD API Router

Implements RESTful endpoints for task management.
All endpoints require JWT authentication and enforce user-scoped access.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.auth import get_current_user
from app.database import get_session
from app.domain.exceptions import TaskNotFoundError, TaskValidationError
from app.domain.value_objects.task_status import TaskStatus
from app.infrastructure.models import TaskDB
from app.infrastructure.repositories.postgresql_task_repository import (
    PostgreSQLTaskRepository,
)
from app.application.use_cases.add_task import AddTaskUseCase
from app.application.use_cases.list_tasks import ListTasksUseCase
from app.application.use_cases.update_task import UpdateTaskUseCase
from app.application.use_cases.delete_task import DeleteTaskUseCase
from app.application.use_cases.complete_task import CompleteTaskUseCase
from app.application.use_cases.uncomplete_task import UncompleteTaskUseCase
from app.presentation.schemas.task import (
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskResponse,
)


router = APIRouter(prefix="/api", tags=["tasks"])


def _verify_user_access(url_user_id: str, authenticated_user_id: str) -> None:
    """
    Verify URL user_id matches authenticated user_id from JWT.

    Security: Prevents users from accessing other users' resources.

    Args:
        url_user_id: User ID from URL path parameter
        authenticated_user_id: User ID extracted from JWT token

    Raises:
        HTTPException 403: If user_id mismatch (unauthorized access attempt)
    """
    if url_user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot access another user's tasks",
        )


def _task_to_response(task) -> TaskResponse:
    """
    Convert domain Task entity to API TaskResponse.

    Args:
        task: Domain Task entity

    Returns:
        TaskResponse suitable for JSON serialization
    """
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.status.is_completed(),
        created_at=task.created_at,
        updated_at=getattr(task, 'updated_at', task.created_at),
    )


@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
def list_tasks(
    user_id: str,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
    completed: Optional[bool] = Query(
        default=None,
        description="Filter by completion status (true=completed, false=pending, null=all)",
    ),
) -> List[TaskResponse]:
    """
    List all tasks for authenticated user.

    Query Parameters:
    - completed (optional): Filter by completion status
      - true: Only completed tasks
      - false: Only pending tasks
      - omit: All tasks

    Security:
    - Requires valid JWT token
    - URL user_id must match token user_id
    - Only returns tasks belonging to authenticated user

    Returns:
        List of tasks sorted by creation date (newest first)

    Raises:
        HTTPException 401: Invalid or missing JWT token
        HTTPException 403: URL user_id doesn't match token user_id
    """
    # Verify user authorization
    _verify_user_access(user_id, authenticated_user_id)

    # Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # Execute use case
    use_case = ListTasksUseCase(repo)
    tasks = use_case.execute()

    # Filter by completion status if specified
    if completed is not None:
        tasks = [task for task in tasks if task.status.is_completed() == completed]

    # Convert to response schema
    return [_task_to_response(task) for task in tasks]


@router.post(
    "/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    user_id: str,
    request: TaskCreateRequest,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Create a new task for authenticated user.

    Request Body:
    - title (required): Task title (1-200 characters)
    - description (optional): Task description (0-1000 characters)

    Security:
    - Requires valid JWT token
    - URL user_id must match token user_id
    - Task automatically associated with authenticated user

    Returns:
        Created task with assigned ID and timestamps

    Raises:
        HTTPException 400: Validation error (invalid title/description)
        HTTPException 401: Invalid or missing JWT token
        HTTPException 403: URL user_id doesn't match token user_id
    """
    # Verify user authorization
    _verify_user_access(user_id, authenticated_user_id)

    # Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # Execute use case
    use_case = AddTaskUseCase(repo)

    try:
        task = use_case.execute(
            title=request.title,
            description=request.description or "",
        )
    except TaskValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Convert to response schema
    return _task_to_response(task)


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Get single task by ID.

    Security:
    - Requires valid JWT token
    - URL user_id must match token user_id
    - Returns 404 if task doesn't exist OR belongs to another user
      (prevents information leakage about other users' task IDs)

    Args:
        user_id: User identifier from URL
        task_id: Task identifier from URL

    Returns:
        Task details

    Raises:
        HTTPException 401: Invalid or missing JWT token
        HTTPException 403: URL user_id doesn't match token user_id
        HTTPException 404: Task not found or belongs to another user
    """
    # Verify user authorization
    _verify_user_access(user_id, authenticated_user_id)

    # Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # Get task (repository automatically filters by user_id)
    task = repo.get_by_id(task_id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Convert to response schema
    return _task_to_response(task)


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    user_id: str,
    task_id: int,
    request: TaskUpdateRequest,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Update task title and/or description.

    Request Body (at least one field required):
    - title (optional): New task title (1-200 characters)
    - description (optional): New task description (0-1000 characters)

    Note: This is a partial update. Only provided fields are updated.

    Security:
    - Requires valid JWT token
    - URL user_id must match token user_id
    - Returns 404 if task doesn't exist OR belongs to another user

    Args:
        user_id: User identifier from URL
        task_id: Task identifier from URL
        request: Update request with new title and/or description

    Returns:
        Updated task with new updated_at timestamp

    Raises:
        HTTPException 400: Validation error (invalid title/description)
        HTTPException 401: Invalid or missing JWT token
        HTTPException 403: URL user_id doesn't match token user_id
        HTTPException 404: Task not found or belongs to another user
    """
    # Verify user authorization
    _verify_user_access(user_id, authenticated_user_id)

    # Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # Execute use case
    use_case = UpdateTaskUseCase(repo)

    try:
        task = use_case.execute(
            task_id=task_id,
            title=request.title,
            description=request.description,
        )
    except TaskNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    except TaskValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Convert to response schema
    return _task_to_response(task)


@router.delete(
    "/{user_id}/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> None:
    """
    Permanently delete task.

    Security:
    - Requires valid JWT token
    - URL user_id must match token user_id
    - Returns 404 if task doesn't exist OR belongs to another user

    Args:
        user_id: User identifier from URL
        task_id: Task identifier from URL

    Returns:
        204 No Content on success (empty body)

    Raises:
        HTTPException 401: Invalid or missing JWT token
        HTTPException 403: URL user_id doesn't match token user_id
        HTTPException 404: Task not found or belongs to another user
    """
    # Verify user authorization
    _verify_user_access(user_id, authenticated_user_id)

    # Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # Execute use case
    use_case = DeleteTaskUseCase(repo)

    try:
        use_case.execute(task_id=task_id)
    except TaskNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # 204 No Content (FastAPI automatically returns empty body)
    return None


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
def mark_task_complete(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Mark task as completed.

    Security:
    - Requires valid JWT token
    - URL user_id must match token user_id
    - Returns 404 if task doesn't exist OR belongs to another user

    Args:
        user_id: User identifier from URL
        task_id: Task identifier from URL

    Returns:
        Updated task with completed=true and new updated_at timestamp

    Raises:
        HTTPException 401: Invalid or missing JWT token
        HTTPException 403: URL user_id doesn't match token user_id
        HTTPException 404: Task not found or belongs to another user
    """
    # Verify user authorization
    _verify_user_access(user_id, authenticated_user_id)

    # Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # Execute use case
    use_case = CompleteTaskUseCase(repo)

    try:
        task = use_case.execute(task_id=task_id)
    except TaskNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Convert to response schema
    return _task_to_response(task)


@router.patch("/{user_id}/tasks/{task_id}/uncomplete", response_model=TaskResponse)
def mark_task_incomplete(
    user_id: str,
    task_id: int,
    authenticated_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Mark task as pending (uncomplete).

    Security:
    - Requires valid JWT token
    - URL user_id must match token user_id
    - Returns 404 if task doesn't exist OR belongs to another user

    Args:
        user_id: User identifier from URL
        task_id: Task identifier from URL

    Returns:
        Updated task with completed=false and new updated_at timestamp

    Raises:
        HTTPException 401: Invalid or missing JWT token
        HTTPException 403: URL user_id doesn't match token user_id
        HTTPException 404: Task not found or belongs to another user
    """
    # Verify user authorization
    _verify_user_access(user_id, authenticated_user_id)

    # Create user-scoped repository
    repo = PostgreSQLTaskRepository(session, authenticated_user_id)

    # Execute use case
    use_case = UncompleteTaskUseCase(repo)

    try:
        task = use_case.execute(task_id=task_id)
    except TaskNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Convert to response schema
    return _task_to_response(task)

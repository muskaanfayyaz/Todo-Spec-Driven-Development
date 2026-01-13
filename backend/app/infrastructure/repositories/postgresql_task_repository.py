"""
PostgreSQL Task Repository Implementation

Concrete implementation of TaskRepository interface using SQLModel.
Provides user-scoped data access with automatic filtering by user_id.
"""

from typing import Optional, List
from datetime import datetime
from sqlmodel import Session, select

from app.application.interfaces.task_repository import TaskRepository
from app.domain.entities.task import Task
from app.domain.value_objects.task_status import TaskStatus
from app.domain.exceptions import TaskNotFoundError
from app.infrastructure.models import TaskDB


class PostgreSQLTaskRepository(TaskRepository):
    """
    PostgreSQL implementation of TaskRepository.

    This repository is user-scoped - all queries automatically filter by user_id.
    Ensures complete data isolation between users.

    Attributes:
        session: SQLModel database session
        user_id: Authenticated user ID (all queries filtered by this)
    """

    def __init__(self, session: Session, user_id: str):
        """
        Initialize repository with database session and user context.

        Args:
            session: SQLModel database session
            user_id: Authenticated user ID (from JWT)

        Example:
            repo = PostgreSQLTaskRepository(db_session, "user-123")
            tasks = repo.get_all()  # Only returns tasks for user-123
        """
        self.session = session
        self.user_id = user_id

    def add(self, task: Task) -> Task:
        """
        Add a new task to database.

        Converts domain Task entity to TaskDB model,
        automatically sets user_id, and persists to database.

        Args:
            task: Domain Task entity to add

        Returns:
            Task: Added task with database-generated ID

        Note:
            - user_id is automatically set from repository context
            - ID from task parameter is ignored (database generates new ID)
            - created_at and updated_at are set by database
        """
        # Convert domain entity to database model
        db_task = TaskDB(
            user_id=self.user_id,  # Automatically set from context
            title=task.title,
            description=task.description,
            completed=task.status.is_completed(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Add to session and flush to get ID
        self.session.add(db_task)
        self.session.commit()
        self.session.refresh(db_task)

        # Convert back to domain entity
        return self._to_domain(db_task)

    def get_by_id(self, task_id: int) -> Optional[Task]:
        """
        Get task by ID if it belongs to authenticated user.

        Automatically filters by user_id for security.
        Returns None if task doesn't exist OR belongs to another user.

        Args:
            task_id: Task identifier

        Returns:
            Task if found and belongs to user, None otherwise

        Security:
            - Filters by both task_id AND user_id
            - Same error whether task doesn't exist or belongs to another user
            - Fail-secure design prevents information leakage
        """
        statement = select(TaskDB).where(
            TaskDB.id == task_id,
            TaskDB.user_id == self.user_id  # Critical: user_id filter
        )
        db_task = self.session.exec(statement).first()

        if db_task is None:
            return None

        return self._to_domain(db_task)

    def get_all(self) -> List[Task]:
        """
        Get all tasks for authenticated user.

        Automatically filters by user_id. Never returns tasks from other users.

        Returns:
            List of Task entities belonging to user (may be empty)

        Security:
            - ALL queries filter by user_id
            - Impossible to access other users' tasks through this method
        """
        statement = select(TaskDB).where(
            TaskDB.user_id == self.user_id  # Critical: user_id filter
        ).order_by(
            TaskDB.created_at.desc()  # Newest first
        )
        db_tasks = self.session.exec(statement).all()

        return [self._to_domain(task) for task in db_tasks]

    def update(self, task: Task) -> Task:
        """
        Update existing task if it belongs to authenticated user.

        Args:
            task: Domain Task entity with updated values

        Returns:
            Updated Task entity

        Raises:
            TaskNotFoundError: If task doesn't exist or belongs to another user

        Security:
            - Verifies task belongs to user before updating
            - Cannot update other users' tasks
        """
        # Find task (automatically filters by user_id)
        statement = select(TaskDB).where(
            TaskDB.id == task.id,
            TaskDB.user_id == self.user_id  # Critical: user_id filter
        )
        db_task = self.session.exec(statement).first()

        if db_task is None:
            raise TaskNotFoundError(f"Task {task.id} not found")

        # Update fields
        db_task.title = task.title
        db_task.description = task.description
        db_task.completed = task.status.is_completed()
        db_task.updated_at = datetime.utcnow()

        # Commit changes
        self.session.add(db_task)
        self.session.commit()
        self.session.refresh(db_task)

        return self._to_domain(db_task)

    def delete(self, task_id: int) -> bool:
        """
        Delete task if it belongs to authenticated user.

        Args:
            task_id: Task identifier

        Returns:
            True if deleted, False if not found or doesn't belong to user

        Security:
            - Filters by both task_id AND user_id
            - Cannot delete other users' tasks
        """
        statement = select(TaskDB).where(
            TaskDB.id == task_id,
            TaskDB.user_id == self.user_id  # Critical: user_id filter
        )
        db_task = self.session.exec(statement).first()

        if db_task is None:
            return False

        self.session.delete(db_task)
        self.session.commit()
        return True

    def exists(self, task_id: int) -> bool:
        """
        Check if task exists and belongs to authenticated user.

        Args:
            task_id: Task identifier

        Returns:
            True if task exists and belongs to user, False otherwise

        Security:
            - Filters by user_id
            - Returns False for other users' tasks
        """
        statement = select(TaskDB).where(
            TaskDB.id == task_id,
            TaskDB.user_id == self.user_id  # Critical: user_id filter
        )
        db_task = self.session.exec(statement).first()
        return db_task is not None

    def get_next_id(self) -> int:
        """
        Get next available task ID.

        Note: With auto-incrementing SERIAL primary key,
        this method is not used. Database generates IDs automatically.

        Returns:
            Next ID (always returns 0 as database handles ID generation)
        """
        # PostgreSQL SERIAL handles ID generation automatically
        # This method exists for interface compatibility but is not used
        return 0

    # Helper methods for domain ↔ database mapping

    def _to_domain(self, db_task: TaskDB) -> Task:
        """
        Convert database model to domain entity.

        Maps database representation to domain model:
        - completed (bool) → status (TaskStatus enum)
        - Includes created_at from database
        - Excludes user_id (not part of domain model)

        Args:
            db_task: Database TaskDB model

        Returns:
            Domain Task entity
        """
        status = (
            TaskStatus.COMPLETED
            if db_task.completed
            else TaskStatus.PENDING
        )

        return Task(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description or "",
            status=status,
            created_at=db_task.created_at
        )

    def _to_db(self, task: Task) -> TaskDB:
        """
        Convert domain entity to database model.

        Maps domain model to database representation:
        - status (TaskStatus enum) → completed (bool)
        - Adds user_id from repository context
        - Sets updated_at to current time

        Args:
            task: Domain Task entity

        Returns:
            Database TaskDB model

        Note:
            This is used internally for conversions.
            Not typically needed as add() and update() handle conversion.
        """
        return TaskDB(
            id=task.id,
            user_id=self.user_id,  # Automatically set from context
            title=task.title,
            description=task.description,
            completed=task.status.is_completed(),
            created_at=task.created_at,
            updated_at=datetime.utcnow()
        )

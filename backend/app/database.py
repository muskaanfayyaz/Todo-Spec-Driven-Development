"""
Database Connection and Session Management

Manages SQLModel engine and database sessions.
Provides dependency injection for FastAPI endpoints.
"""

from sqlmodel import SQLModel, create_engine, Session
from app.config import get_settings


settings = get_settings()

# Create database engine
# pool_pre_ping ensures connections are alive before using
# echo prints SQL statements when debug=True
engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=5,  # Connection pool size
    max_overflow=10,  # Max overflow connections
)


def create_db_and_tables():
    """
    Create all database tables defined in SQLModel.

    This should be called on application startup.
    Creates tables for all SQLModel classes with table=True.

    Note: Better Auth creates users table automatically.
    This only creates tasks table and any future tables.
    """
    # Import models to ensure they're registered
    from app.infrastructure.models import TaskDB  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session():
    """
    Dependency for getting database session.

    FastAPI dependency that provides a database session
    to endpoint handlers. Automatically closes session
    after request completes.

    Yields:
        Session: Database session

    Usage:
        @app.get("/api/{user_id}/tasks")
        def get_tasks(session: Session = Depends(get_session)):
            tasks = session.query(TaskDB).all()
            return tasks
    """
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()

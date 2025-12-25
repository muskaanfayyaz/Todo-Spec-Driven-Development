"""Domain exceptions."""


class TodoAppException(Exception):
    """Base exception for todo application."""
    pass


class DomainException(TodoAppException):
    """Base exception for domain layer."""
    pass


class TaskValidationError(DomainException):
    """Raised when task validation fails."""
    pass


class ApplicationException(TodoAppException):
    """Base exception for application layer."""
    pass


class TaskNotFoundError(ApplicationException):
    """Raised when task is not found."""
    pass


class PresentationException(TodoAppException):
    """Base exception for presentation layer."""
    pass


class InvalidCommandError(PresentationException):
    """Raised when command is invalid."""
    pass

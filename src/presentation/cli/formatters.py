"""Output formatters for CLI."""
from typing import List
from domain.entities.task import Task


def format_task_list(tasks: List[Task]) -> str:
    """Format a list of tasks as a table.

    Args:
        tasks: List of tasks to format

    Returns:
        Formatted table string
    """
    if not tasks:
        return "No tasks found.\nUse 'add' command to create your first task!"

    # Calculate column widths
    id_width = 4
    title_width = 20
    desc_width = 22
    status_width = 11

    # Create table
    lines = []

    # Header
    lines.append("┌" + "─" * id_width + "┬" + "─" * title_width + "┬" +
                 "─" * desc_width + "┬" + "─" * status_width + "┐")
    lines.append("│ ID │ Title              │ Description          │ Status    │")
    lines.append("├" + "─" * id_width + "┼" + "─" * title_width + "┼" +
                 "─" * desc_width + "┼" + "─" * status_width + "┤")

    # Rows
    for task in tasks:
        task_id = f" {task.id:<2} "
        title = truncate_text(task.title, 18)
        title = f" {title:<18} "
        desc = truncate_text(task.description, 20)
        desc = f" {desc:<20} "
        status = f" {task.status.value:<9} "

        lines.append(f"│{task_id}│{title}│{desc}│{status}│")

    # Footer
    lines.append("└" + "─" * id_width + "┴" + "─" * title_width + "┴" +
                 "─" * desc_width + "┴" + "─" * status_width + "┘")

    # Summary
    total = len(tasks)
    pending = sum(1 for t in tasks if t.status.is_pending())
    completed = sum(1 for t in tasks if t.status.is_completed())
    lines.append(f"\nTotal: {total} tasks ({pending} pending, {completed} completed)")

    return "\n".join(lines)


def format_task_detail(task: Task) -> str:
    """Format a single task with full details.

    Args:
        task: Task to format

    Returns:
        Formatted task detail string
    """
    lines = [
        f"  ID: {task.id}",
        f"  Title: {task.title}",
        f"  Description: {task.description}",
        f"  Status: {task.status.value}",
        f"  Created: {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
    ]
    return "\n".join(lines)


def truncate_text(text: str, max_length: int) -> str:
    """Truncate text to maximum length.

    Args:
        text: Text to truncate
        max_length: Maximum length

    Returns:
        Truncated text with "..." if necessary
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."

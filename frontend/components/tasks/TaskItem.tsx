"use client";

/**
 * Premium TaskItem Component
 *
 * World-class task item with elegant interactions and refined design.
 * Features smooth checkbox animation, contextual actions, and premium hover states.
 */

import { useState } from "react";
import { api } from "@/lib/api-client";
import { formatDate, cn } from "@/lib/utils";
import { Button, IconButton } from "@/components/ui";
import EditTaskModal from "./EditTaskModal";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskItemProps {
  task: Task;
  userId: string;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export default function TaskItem({
  task,
  userId,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  async function handleToggleComplete() {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const updatedTask = { ...task, completed: !task.completed };
    onUpdate(updatedTask);

    try {
      const endpoint = task.completed ? "uncomplete" : "complete";
      const data = await api.patch<Task>(
        `/api/${userId}/tasks/${task.id}/${endpoint}`
      );
      onUpdate(data);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      onUpdate(task); // Revert
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return;

    setLoading(true);
    onDelete(task.id); // Optimistic

    try {
      await api.delete(`/api/${userId}/tasks/${task.id}`);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "group relative",
          "px-5 py-4",
          "transition-all duration-200 ease-out",
          "hover:bg-neutral-50/80",
          "border-b border-neutral-100 last:border-b-0",
          loading && "opacity-60 pointer-events-none"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-4">
          {/* Premium Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={cn(
              "relative flex-shrink-0 mt-0.5",
              "w-5 h-5 rounded-md",
              "border-2 transition-all duration-200 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
              task.completed
                ? "bg-primary-500 border-primary-500 shadow-sm"
                : "bg-white border-neutral-300 hover:border-primary-400 hover:shadow-sm",
              loading && "cursor-not-allowed"
            )}
            aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
          >
            {/* Checkmark with animation */}
            <svg
              className={cn(
                "absolute inset-0 w-full h-full p-0.5 text-white",
                "transition-all duration-200",
                task.completed
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-75"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>

            {/* Ripple effect on complete */}
            {task.completed && (
              <span className="absolute inset-0 rounded-md bg-primary-400 animate-ping opacity-20" />
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={cn(
                "text-sm font-medium leading-snug",
                "transition-all duration-200",
                task.completed
                  ? "text-neutral-400 line-through decoration-neutral-300"
                  : "text-neutral-900"
              )}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p
                className={cn(
                  "mt-1 text-sm leading-relaxed",
                  "transition-all duration-200",
                  task.completed ? "text-neutral-400" : "text-neutral-500"
                )}
              >
                {task.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="mt-2 flex items-center gap-3">
              {/* Created Date */}
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(task.created_at)}
              </span>

              {/* Completed Badge */}
              {task.completed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Done
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={cn(
              "flex items-center gap-1 flex-shrink-0",
              "transition-all duration-200",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            )}
          >
            {/* Edit Button */}
            <IconButton
              onClick={() => setIsEditing(true)}
              disabled={loading}
              variant="ghost"
              size="sm"
              aria-label="Edit task"
              className="text-neutral-500 hover:text-primary-600 hover:bg-primary-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </IconButton>

            {/* Delete Button */}
            <IconButton
              onClick={handleDelete}
              disabled={loading}
              variant="ghost"
              size="sm"
              aria-label="Delete task"
              className="text-neutral-500 hover:text-danger-600 hover:bg-danger-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </IconButton>
          </div>
        </div>

        {/* Hover Indicator */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-0.5 bg-primary-500",
            "transition-all duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditTaskModal
          task={task}
          userId={userId}
          onUpdate={onUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}

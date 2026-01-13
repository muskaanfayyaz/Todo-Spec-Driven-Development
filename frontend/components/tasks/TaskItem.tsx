"use client";

/**
 * TaskItem Component - Premium UI
 *
 * Displays a single task with modern design and smooth interactions.
 */

import { useState } from "react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
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

  async function handleToggleComplete() {
    setLoading(true);

    // Optimistic update
    const updatedTask = { ...task, completed: !task.completed };
    onUpdate(updatedTask);

    try {
      // Call appropriate endpoint based on current state
      const endpoint = task.completed ? "uncomplete" : "complete";
      const data = await api.patch<Task>(
        `/api/${userId}/tasks/${task.id}/${endpoint}`
      );

      // Update with server response
      onUpdate(data);
    } catch (error) {
      console.error("Failed to toggle task:", error);

      // Revert optimistic update on error
      onUpdate(task);

      alert("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete task "${task.title}"?`)) {
      return;
    }

    setLoading(true);

    // Optimistic removal
    onDelete(task.id);

    try {
      await api.delete(`/api/${userId}/tasks/${task.id}`);
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="group p-6 hover:bg-neutral-50 transition-colors duration-200">
        <div className="flex items-start gap-4">
          {/* Custom Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`
              flex-shrink-0 mt-1 w-6 h-6 rounded-lg border-2 transition-all duration-200
              ${
                task.completed
                  ? 'bg-success-500 border-success-500'
                  : 'bg-white border-neutral-300 hover:border-primary-400'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            `}
            aria-label={`Mark "${task.title}" as ${
              task.completed ? "incomplete" : "complete"
            }`}
          >
            {task.completed && (
              <svg
                className="w-full h-full text-white p-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`
                text-base font-medium mb-1 transition-all duration-200
                ${
                  task.completed
                    ? "line-through text-neutral-500"
                    : "text-neutral-900"
                }
              `}
            >
              {task.title}
            </h3>
            {task.description && (
              <p
                className={`
                  text-sm leading-relaxed transition-all duration-200
                  ${task.completed ? "text-neutral-400" : "text-neutral-600"}
                `}
              >
                {task.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(task.created_at)}
              </span>
              {task.completed && (
                <span className="flex items-center gap-1 text-success-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              variant="ghost"
              size="sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="text-danger-600 hover:bg-danger-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
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

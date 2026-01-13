"use client";

/**
 * EditTaskModal Component - Premium UI
 *
 * Modern modal dialog for editing existing tasks.
 */

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface EditTaskModalProps {
  task: Task;
  userId: string;
  onUpdate: (task: Task) => void;
  onClose: () => void;
}

export default function EditTaskModal({
  task,
  userId,
  onUpdate,
  onClose,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (title.length > 200) {
      setError("Title cannot exceed 200 characters");
      return;
    }

    if (description.length > 1000) {
      setError("Description cannot exceed 1000 characters");
      return;
    }

    // Check if anything changed
    if (title.trim() === task.title && description.trim() === task.description) {
      onClose();
      return;
    }

    setLoading(true);

    try {
      // Update task via API
      const updatedTask = await api.put<Task>(
        `/api/${userId}/tasks/${task.id}`,
        {
          title: title.trim(),
          description: description.trim(),
        }
      );

      // Notify parent
      onUpdate(updatedTask);

      // Close modal
      onClose();
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-modal"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-modal pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden pointer-events-auto scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Edit Task
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                Update your task details
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {error && (
              <div className="rounded-lg bg-danger-50 border border-danger-200 p-4 mb-6 fade-in">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium text-danger-800">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <Input
                label="Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                maxLength={200}
                required
                fullWidth
                helperText={`${title.length}/200 characters`}
              />

              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={4}
                maxLength={1000}
                showCount
                autoResize
                fullWidth
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-200">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="secondary"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              loading={loading}
              fullWidth
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

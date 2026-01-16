"use client";

/**
 * Premium EditTaskModal Component
 *
 * Elegant modal for editing tasks with smooth animations and refined design.
 * Features backdrop blur, scale animation, and premium form styling.
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button, Input, Textarea } from "@/components/ui";

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
  const [isClosing, setIsClosing] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus title input on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Handle escape key and click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        handleClose();
      }
    }

    // Prevent body scroll
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading]);

  function handleClose() {
    setIsClosing(true);
    setTimeout(onClose, 150);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    if (trimmedTitle.length > 200) {
      setError("Title cannot exceed 200 characters");
      return;
    }

    if (description.length > 1000) {
      setError("Description cannot exceed 1000 characters");
      return;
    }

    // Check for changes
    if (trimmedTitle === task.title && description.trim() === task.description) {
      handleClose();
      return;
    }

    setLoading(true);

    try {
      const updatedTask = await api.put<Task>(
        `/api/${userId}/tasks/${task.id}`,
        {
          title: trimmedTitle,
          description: description.trim(),
        }
      );

      onUpdate(updatedTask);
      handleClose();
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const hasChanges =
    title.trim() !== task.title || description.trim() !== task.description;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40",
          "bg-neutral-900/40 backdrop-blur-sm",
          "transition-opacity duration-200",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={cn(
            "relative w-full max-w-lg",
            "bg-white rounded-2xl shadow-2xl",
            "pointer-events-auto",
            "transform transition-all duration-200",
            isClosing
              ? "opacity-0 scale-95 translate-y-2"
              : "opacity-100 scale-100 translate-y-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary-600"
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
              </div>
              <div>
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-neutral-900"
                >
                  Edit Task
                </h2>
                <p className="text-sm text-neutral-500">
                  Update your task details
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={loading}
              className={cn(
                "p-2 -m-2 rounded-lg",
                "text-neutral-400 hover:text-neutral-600",
                "hover:bg-neutral-100",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                loading && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Error Alert */}
              {error && (
                <div className="animate-fade-in rounded-lg bg-danger-50 border border-danger-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-danger-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-danger-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-danger-800 flex-1">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="p-1 rounded hover:bg-danger-100 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-danger-500"
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
                </div>
              )}

              {/* Title Input */}
              <div>
                <label
                  htmlFor="task-title"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  Title
                </label>
                <div className="relative">
                  <Input
                    ref={titleInputRef}
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    maxLength={200}
                    className="pr-16"
                  />
                  <span
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums",
                      title.length > 180 ? "text-warning-600" : "text-neutral-400"
                    )}
                  >
                    {title.length}/200
                  </span>
                </div>
              </div>

              {/* Description Textarea */}
              <div>
                <label
                  htmlFor="task-description"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  Description
                  <span className="text-neutral-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <Textarea
                  id="task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={4}
                  placeholder="Add more details..."
                  maxLength={1000}
                  showCount
                  autoResize
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-100 rounded-b-2xl">
              <Button
                type="button"
                onClick={handleClose}
                disabled={loading}
                variant="ghost"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || loading}
                loading={loading}
                className="flex-1"
              >
                {loading ? "Saving..." : hasChanges ? "Save Changes" : "Done"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  // Render modal in portal
  if (typeof window === "undefined") return null;

  return createPortal(modalContent, document.body);
}

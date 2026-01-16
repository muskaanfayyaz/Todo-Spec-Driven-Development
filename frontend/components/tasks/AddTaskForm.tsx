"use client";

/**
 * Premium AddTaskForm Component
 *
 * Elegant form for creating new tasks with refined interactions.
 * Features smooth validation, character counts, and premium submit button.
 */

import { useState, useRef, useEffect } from "react";
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

interface AddTaskFormProps {
  userId: string;
  onTaskAdded: (task: Task) => void;
}

export default function AddTaskForm({ userId, onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a task title");
      return;
    }

    if (trimmedTitle.length > 200) {
      setError("Title is too long (max 200 characters)");
      return;
    }

    if (description.length > 1000) {
      setError("Description is too long (max 1000 characters)");
      return;
    }

    setLoading(true);

    try {
      const newTask = await api.post<Task>(`/api/${userId}/tasks`, {
        title: trimmedTitle,
        description: description.trim(),
      });

      // Clear form
      setTitle("");
      setDescription("");
      setShowDescription(false);

      // Notify parent
      onTaskAdded(newTask);

      // Refocus title input for quick entry
      titleInputRef.current?.focus();
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = title.trim().length > 0 && !loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            <p className="text-sm font-medium text-danger-800">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-auto p-1 rounded hover:bg-danger-100 transition-colors"
            >
              <svg className="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Title Input */}
      <div className="relative">
        <Input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          placeholder="What needs to be done?"
          maxLength={200}
          className="pr-16"
          leftIcon={
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
        />
        {/* Character Count */}
        <span
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums",
            title.length > 180 ? "text-warning-600" : "text-neutral-400"
          )}
        >
          {title.length}/200
        </span>
      </div>

      {/* Description Toggle & Field */}
      {!showDescription ? (
        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className={cn(
            "inline-flex items-center gap-2 text-sm",
            "text-neutral-500 hover:text-primary-600",
            "transition-colors duration-150"
          )}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add description
        </button>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-neutral-700">
              Description
            </label>
            <button
              type="button"
              onClick={() => {
                setDescription("");
                setShowDescription(false);
              }}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Remove
            </button>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={3}
            placeholder="Add more details about this task..."
            maxLength={1000}
            showCount
            autoResize
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!canSubmit}
        loading={loading}
        fullWidth
        className="mt-2"
      >
        {loading ? (
          "Adding..."
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Task
          </>
        )}
      </Button>

      {/* Keyboard Hint */}
      <p className="text-xs text-center text-neutral-400">
        Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono text-xs">Enter</kbd> to add quickly
      </p>
    </form>
  );
}

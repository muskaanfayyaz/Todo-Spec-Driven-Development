"use client";

/**
 * AddTaskForm Component - Premium UI
 *
 * Form to create new tasks with modern design.
 * Uses design system components for consistency.
 */

import { useState } from "react";
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

interface AddTaskFormProps {
  userId: string;
  onTaskAdded: (task: Task) => void;
}

export default function AddTaskForm({ userId, onTaskAdded }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setLoading(true);

    try {
      // Create task via API
      const newTask = await api.post<Task>(`/api/${userId}/tasks`, {
        title: title.trim(),
        description: description.trim(),
      });

      // Clear form
      setTitle("");
      setDescription("");

      // Notify parent
      onTaskAdded(newTask);
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-4 fade-in">
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

      <Input
        label="Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        placeholder="What needs to be done?"
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
        placeholder="Add more details (optional)"
        maxLength={1000}
        showCount
        autoResize
        fullWidth
      />

      <Button
        type="submit"
        disabled={loading || !title.trim()}
        loading={loading}
        fullWidth
        size="lg"
      >
        {loading ? "Adding Task..." : "Add Task"}
      </Button>
    </form>
  );
}

"use client";

/**
 * TaskList Component - Premium UI
 *
 * Displays list of tasks with empty states and modern design.
 */

import TaskItem from "./TaskItem";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskListProps {
  tasks: Task[];
  userId: string;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export default function TaskList({
  tasks,
  userId,
  onUpdate,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-full mb-6">
          <svg
            className="w-10 h-10 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          No tasks here
        </h3>
        <p className="text-neutral-600 max-w-sm mx-auto">
          You don't have any tasks in this view. Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TaskItem
            task={task}
            userId={userId}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}

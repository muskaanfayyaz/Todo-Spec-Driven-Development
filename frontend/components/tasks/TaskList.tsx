"use client";

/**
 * Premium TaskList Component
 *
 * Elegant task list with staggered animations and beautiful empty states.
 * Features smooth transitions and refined visual hierarchy.
 */

import { cn } from "@/lib/utils";
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
  // Empty State
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
        {/* Illustrated Icon */}
        <div className="relative mb-6">
          {/* Background glow */}
          <div className="absolute inset-0 w-20 h-20 bg-primary-100 rounded-full blur-xl opacity-60" />

          {/* Icon container */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-primary-50 to-violet-50 rounded-2xl flex items-center justify-center border border-primary-100/50">
            <svg
              className="w-10 h-10 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          No tasks yet
        </h3>
        <p className="text-sm text-neutral-500 text-center max-w-xs leading-relaxed">
          Your task list is empty. Add your first task above to start organizing your day.
        </p>

        {/* Decorative dots */}
        <div className="flex items-center gap-1.5 mt-6">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${Math.min(index * 50, 300)}ms`,
            animationFillMode: "both",
          }}
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

// Compact variant for sidebars or widgets
export function TaskListCompact({
  tasks,
  userId,
  onUpdate,
  onDelete,
  maxItems = 5,
}: TaskListProps & { maxItems?: number }) {
  const displayTasks = tasks.slice(0, maxItems);
  const remainingCount = tasks.length - maxItems;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-sm text-neutral-500">No tasks</p>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-neutral-100">
        {displayTasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
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

      {remainingCount > 0 && (
        <div className="px-5 py-3 text-center border-t border-neutral-100">
          <span className="text-xs text-neutral-500">
            +{remainingCount} more task{remainingCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

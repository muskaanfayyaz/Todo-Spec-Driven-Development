"use client";

/**
 * Tasks Page - Premium UI
 *
 * Protected route that displays user's task list with modern SaaS design.
 * Requires authentication (enforced by middleware).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { api } from "@/lib/api-client";
import AddTaskForm from "@/components/tasks/AddTaskForm";
import TaskList from "@/components/tasks/TaskList";
import { Button, LoadingState, ErrorState } from "@/components/ui";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load session and tasks on mount
  useEffect(() => {
    async function loadData() {
      try {
        // EXPLICIT AUTHENTICATION CHECK - Must have valid session
        const session = await getSession();

        if (!session || !session.user || !session.user.id) {
          console.error("[Tasks Page] No valid session found - redirecting to login");
          router.push("/login");
          return;
        }

        console.log("[Tasks Page] Authenticated user:", session.user.email);
        setUserId(session.user.id);
        setUserName(session.user.name || session.user.email);

        // Fetch tasks with JWT authentication
        console.log("[Tasks Page] Fetching tasks for user:", session.user.id);
        const tasksData = await api.get<Task[]>(
          `/api/${session.user.id}/tasks`
        );
        console.log("[Tasks Page] Tasks loaded:", tasksData.length);
        setTasks(tasksData);
      } catch (err: any) {
        console.error("[Tasks Page] Error loading tasks:", err);

        // Handle authentication errors explicitly
        if (err.statusCode === 401) {
          console.error("[Tasks Page] Authentication failed - redirecting to login");
          router.push("/login");
          return;
        }

        setError(err.message || "Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  function handleTaskAdded(newTask: Task) {
    setTasks([newTask, ...tasks]);
  }

  function handleTaskUpdated(updatedTask: Task) {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  }

  function handleTaskDeleted(taskId: number) {
    setTasks(tasks.filter((t) => t.id !== taskId));
  }

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  if (loading) {
    return <LoadingState message="Loading your tasks..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }

  if (!userId) {
    return null; // Redirecting to login
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-sticky backdrop-blur-sm bg-white/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Tasks
              </h1>
              {userName && (
                <p className="text-sm text-neutral-500 mt-0.5">
                  Welcome back, {userName}
                </p>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-neutral-50 rounded-lg px-4 py-3 border border-neutral-200">
              <div className="text-2xl font-bold text-neutral-900">
                {stats.total}
              </div>
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Total Tasks
              </div>
            </div>
            <div className="bg-primary-50 rounded-lg px-4 py-3 border border-primary-200">
              <div className="text-2xl font-bold text-primary-900">
                {stats.active}
              </div>
              <div className="text-xs font-medium text-primary-700 uppercase tracking-wide">
                Active
              </div>
            </div>
            <div className="bg-success-50 rounded-lg px-4 py-3 border border-success-200">
              <div className="text-2xl font-bold text-success-900">
                {stats.completed}
              </div>
              <div className="text-xs font-medium text-success-700 uppercase tracking-wide">
                Completed
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Add Task Form */}
        <div className="bg-white shadow-sm rounded-xl border border-neutral-200 p-6 fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Create New Task
              </h2>
              <p className="text-sm text-neutral-500">
                Add a new task to your list
              </p>
            </div>
          </div>
          <AddTaskForm userId={userId} onTaskAdded={handleTaskAdded} />
        </div>

        {/* Filter Tabs */}
        <div className="bg-white shadow-sm rounded-xl border border-neutral-200 p-2 flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All Tasks
            <span className="ml-2 text-xs opacity-75">({stats.total})</span>
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'active'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Active
            <span className="ml-2 text-xs opacity-75">({stats.active})</span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'completed'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Completed
            <span className="ml-2 text-xs opacity-75">({stats.completed})</span>
          </button>
        </div>

        {/* Task List */}
        <div className="bg-white shadow-sm rounded-xl border border-neutral-200 overflow-hidden">
          <TaskList
            tasks={filteredTasks}
            userId={userId}
            onUpdate={handleTaskUpdated}
            onDelete={handleTaskDeleted}
          />
        </div>
      </main>
    </div>
  );
}

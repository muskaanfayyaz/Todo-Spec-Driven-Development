/**
 * Task API Functions
 *
 * High-level API functions for task management.
 * Uses api-client for authenticated requests.
 */

import { api } from "./api-client";
import { getSession } from "./auth";

/**
 * Task type definition
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  priority?: "low" | "medium" | "high";
  due_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Task creation payload
 */
export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  due_date?: string;
}

/**
 * Task update payload
 */
export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: "pending" | "completed";
  priority?: "low" | "medium" | "high";
  due_date?: string;
}

/**
 * Get the user ID from session for API endpoints
 */
async function getUserEndpoint(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return `/api/user-${session.user.id}/tasks`;
}

/**
 * Get all tasks for the current user
 */
export async function getTasks(): Promise<Task[]> {
  try {
    const endpoint = await getUserEndpoint();
    return await api.get<Task[]>(endpoint);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string): Promise<Task | null> {
  try {
    const endpoint = await getUserEndpoint();
    return await api.get<Task>(`${endpoint}/${taskId}`);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return null;
  }
}

/**
 * Create a new task
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const endpoint = await getUserEndpoint();
  return await api.post<Task>(endpoint, payload);
}

/**
 * Update an existing task
 */
export async function updateTask(
  taskId: string,
  payload: UpdateTaskPayload
): Promise<Task> {
  const endpoint = await getUserEndpoint();
  return await api.put<Task>(`${endpoint}/${taskId}`, payload);
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  const endpoint = await getUserEndpoint();
  await api.delete(`${endpoint}/${taskId}`);
}

/**
 * Mark a task as completed
 */
export async function completeTask(taskId: string): Promise<Task> {
  return updateTask(taskId, { status: "completed" });
}

/**
 * Mark a task as pending (uncomplete)
 */
export async function uncompleteTask(taskId: string): Promise<Task> {
  return updateTask(taskId, { status: "pending" });
}

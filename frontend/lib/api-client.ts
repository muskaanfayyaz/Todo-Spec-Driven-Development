/**
 * API Client for Backend Communication
 *
 * Handles HTTP requests to FastAPI backend with JWT authentication.
 * Automatically includes JWT token in Authorization header.
 */

import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * API error response structure.
 */
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string>;
}

/**
 * API client error class.
 */
export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public error: ApiError
  ) {
    super(error.message);
    this.name = "ApiClientError";
  }
}

/**
 * Make authenticated API request to backend.
 *
 * @param endpoint API endpoint path (e.g., "/api/user-123/tasks")
 * @param options Fetch options (method, body, etc.)
 * @returns Response data
 * @throws ApiClientError on HTTP errors
 * @throws Error on network errors
 *
 * Features:
 * - Automatically includes JWT token in Authorization header
 * - Handles 401 (redirect to login)
 * - Handles 403 (permission denied)
 * - Parses JSON responses
 * - Throws typed errors
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get JWT token from session
  const token = await getToken();

  // Build headers with authentication
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Merge with any additional headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // Make request
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized (token expired or invalid)
  if (response.status === 401) {
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiClientError(401, {
      error: "Unauthorized",
      message: "Authentication required. Please login.",
    });
  }

  // Handle 403 Forbidden (authenticated but not authorized)
  if (response.status === 403) {
    throw new ApiClientError(403, {
      error: "Forbidden",
      message: "You do not have permission to access this resource.",
    });
  }

  // Handle 204 No Content (successful delete)
  if (response.status === 204) {
    return null as T;
  }

  // Parse response body
  const data = await response.json();

  // Handle error responses (4xx, 5xx)
  if (!response.ok) {
    throw new ApiClientError(response.status, data as ApiError);
  }

  return data as T;
}

/**
 * Convenience methods for common HTTP verbs.
 */
export const api = {
  /**
   * GET request.
   */
  get: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "GET" }),

  /**
   * POST request.
   */
  post: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /**
   * PUT request.
   */
  put: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  /**
   * PATCH request.
   */
  patch: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE request.
   */
  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
};

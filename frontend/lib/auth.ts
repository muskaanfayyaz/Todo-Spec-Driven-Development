/**
 * Better Auth Client Configuration
 *
 * Handles user authentication with JWT tokens.
 * Integrates with backend FastAPI for token verification.
 */

import { createAuthClient } from "better-auth/client";

/**
 * Better Auth client instance (v1.4.10)
 *
 * Configuration:
 * - baseURL: Points to our Next.js app (where Better Auth server runs)
 * - Better Auth v1.4.10 handles sessions via cookies automatically
 * - All requests go through /api/auth/* endpoints
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

/**
 * Type definitions for authentication (Better Auth v0.1 API)
 */
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
}

export interface SessionData {
  id: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface Session {
  user: User;
  session: SessionData;
}

export interface AuthResponse {
  data: Session | null;
  error?: { message?: string };
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Get current session from Better Auth v1.4.10
 *
 * Fetches session from our custom /api/session endpoint.
 * Better Auth v1.4.10 stores session in cookies, which are
 * automatically sent with this request.
 *
 * @returns Session if authenticated, null otherwise
 */
export async function getSession(): Promise<Session | null> {
  try {
    const response = await fetch("/api/session", {
      credentials: "include", // Include cookies
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (!result.data || !result.data.user) {
      return null;
    }

    return {
      user: result.data.user,
      session: result.data.session,
    } as Session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

/**
 * Sign up a new user.
 *
 * @param data User registration data
 * @returns Session with JWT token
 * @throws Error if registration fails
 */
export async function signUp(data: SignUpData): Promise<Session> {
  const result = await authClient.signUp.email({
    email: data.email,
    password: data.password,
    name: data.name || "",
  });

  if (result.error) {
    throw new Error(result.error.message || "Registration failed");
  }

  return result.data as unknown as Session;
}

/**
 * Sign in an existing user.
 *
 * @param data User login credentials
 * @returns Session with JWT token
 * @throws Error if login fails
 */
export async function signIn(data: SignInData): Promise<Session> {
  const result = await authClient.signIn.email({
    email: data.email,
    password: data.password,
  });

  if (result.error) {
    throw new Error(result.error.message || "Login failed");
  }

  return result.data as unknown as Session;
}

/**
 * Sign out current user.
 * Clears JWT token and session data.
 */
export async function signOut(): Promise<void> {
  await authClient.signOut();
}

/**
 * Get JWT token for backend API authentication.
 *
 * Better Auth v1.4.10 uses session-based auth, but our backend expects JWT.
 * This function fetches a JWT token generated from the current session.
 *
 * Flow:
 * 1. Call /api/auth/token with session cookie
 * 2. Backend generates JWT from session
 * 3. JWT includes user_id as 'sub' claim
 * 4. JWT is signed with BETTER_AUTH_SECRET
 * 5. Backend can verify this JWT
 *
 * @returns JWT token string or null if not authenticated
 */
export async function getToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/token", {
      credentials: "include", // Include session cookie
    });

    if (!response.ok) {
      // Session expired or invalid
      return null;
    }

    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error("Failed to get token:", error);
    return null;
  }
}

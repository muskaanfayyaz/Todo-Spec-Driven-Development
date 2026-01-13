/**
 * Next.js Middleware for Route Protection
 *
 * Protects routes that require authentication by checking for JWT token.
 * Redirects unauthenticated users to /login.
 *
 * Protected Routes:
 * - /tasks - Task management page
 * - /tasks/* - Individual task pages
 * - All routes except public routes (login, register, home)
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Routes that require authentication.
 * Users without valid JWT will be redirected to /login.
 */
const PROTECTED_ROUTES = ["/tasks"];

/**
 * Public routes accessible without authentication.
 * Users with valid JWT accessing these will be redirected to /tasks.
 */
const PUBLIC_AUTH_ROUTES = ["/login", "/register"];

/**
 * Middleware function that runs on every request.
 *
 * Authentication Flow:
 * 1. Check if route requires authentication
 * 2. Get JWT token from cookies/session
 * 3. If protected route + no token → redirect to /login
 * 4. If public auth route + has token → redirect to /tasks
 * 5. Otherwise allow request to proceed
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get JWT token from cookies (Better Auth stores it here)
  const token = request.cookies.get("better-auth.session_token")?.value;

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is a public auth route (login/register)
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // If accessing protected route without token → redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname); // Save intended destination
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login/register with valid token → redirect to tasks
  if (isPublicAuthRoute && token) {
    return NextResponse.redirect(new URL("/tasks", request.url));
  }

  // Allow request to proceed
  return NextResponse.next();
}

/**
 * Configure which routes this middleware runs on.
 *
 * Matcher excludes:
 * - API routes (_next/*, /api/*)
 * - Static files (*.png, *.jpg, etc.)
 * - Favicon and other public assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (*.png, *.jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico).*)",
  ],
};

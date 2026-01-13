/**
 * Better Auth API Route Handler (NODE.JS RUNTIME REQUIRED)
 *
 * This file handles all Better Auth authentication requests.
 * Better Auth uses this API route to:
 * - Register new users (with password hashing)
 * - Login existing users (with password verification)
 * - Manage sessions (JWT + database)
 * - Generate JWT tokens
 *
 * All auth operations go through: /api/auth/*
 *
 * CRITICAL: Uses Node.js runtime (NOT Edge runtime)
 * - Edge runtime cannot maintain persistent database connections
 * - Node.js runtime allows connection pooling (4-5s performance gain)
 * - Edge runtime has limited crypto APIs (breaks password hashing)
 */

import { auth } from "@/lib/auth-server";

/**
 * Force Node.js runtime for this route.
 *
 * Why NOT Edge Runtime:
 * 1. Connection pooling requires persistent connections
 * 2. bcrypt/argon2 password hashing needs full Node.js crypto
 * 3. Better Auth internals use Node.js-specific APIs
 *
 * Trade-offs:
 * - Node.js: Slower cold starts (~100ms), supports connection pooling
 * - Edge: Faster cold starts (~10ms), forces fresh connections (4+ seconds)
 *
 * For database-heavy auth operations, Node.js is 40x faster despite cold start penalty.
 */
export const runtime = "nodejs";

/**
 * Prevent static generation of auth routes.
 * Auth operations must be dynamic (user-specific).
 */
export const dynamic = "force-dynamic";

/**
 * Better Auth v1.4.10 Route Handlers
 *
 * Better Auth's handler is a function that processes HTTP requests.
 * We wrap it to match Next.js App Router API.
 *
 * The handler needs to receive the full request context including URL.
 */
export async function GET(request: Request) {
  return auth.handler(request);
}

export async function POST(request: Request) {
  return auth.handler(request);
}

export async function PUT(request: Request) {
  return auth.handler(request);
}

export async function PATCH(request: Request) {
  return auth.handler(request);
}

export async function DELETE(request: Request) {
  return auth.handler(request);
}

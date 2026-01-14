/**
 * Better Auth Server Configuration v1.4.10 (CONNECTION POOLING ENABLED)
 *
 * This is the server-side Better Auth instance.
 * It handles authentication operations in Next.js API routes.
 *
 * PERFORMANCE OPTIMIZATION:
 * - Better Auth creates internal connection pool from DATABASE_URL
 * - Singleton instance reused across all requests (see export pattern)
 * - Eliminates 4+ second connection overhead per request
 * - Reuses SSL/TLS handshake across requests
 */

import { betterAuth } from "better-auth";
import { Pool } from "pg";

/**
 * Server-side Better Auth instance with INTERNAL CONNECTION POOLING
 *
 * This connects to the database and manages:
 * - User registration (with password hashing)
 * - User login (with password verification)
 * - Session management (JWT + database sessions)
 * - JWT token generation
 */

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
  }),

  secret: process.env.BETTER_AUTH_SECRET!,

  session: {
    expiresIn: 60 * 60, // 1 hour in seconds
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://todo-spec-driven-development-fronte.vercel.app",
    process.env.BETTER_AUTH_URL || "",
  ].filter(Boolean),
});

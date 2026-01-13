/**
 * JWT Token Generation Endpoint
 *
 * Generates a JWT token from Better Auth session for backend API authentication.
 *
 * Flow:
 * 1. Read session cookie from Better Auth
 * 2. Validate session exists and is not expired
 * 3. Generate JWT token with user_id as 'sub' claim
 * 4. Sign with BETTER_AUTH_SECRET (shared with backend)
 * 5. Return JWT to frontend for API calls
 */

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import * as jwt from "jsonwebtoken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/token
 *
 * Returns a JWT token for authenticated user to use with backend API.
 * Session must be valid (cookie present and not expired).
 */
export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "No session found" },
        { status: 401 }
      );
    }

    // Better Auth stores the session with a token field, not id
    // The cookie contains the token (before the signature part)
    const sessionTokenValue = sessionToken.split('.')[0]; // Extract token before signature

    // Query database for session
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const sessionResult = await pool.query(
      `SELECT s."userId", s."expiresAt", u.id, u.email
       FROM session s
       JOIN "user" u ON s."userId" = u.id
       WHERE s.token = $1 AND s."expiresAt" > NOW()`,
      [sessionTokenValue]
    );

    await pool.end();

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Session expired or invalid" },
        { status: 401 }
      );
    }

    const row = sessionResult.rows[0];
    const userId = row.userId;
    const expiresAt = new Date(row.expiresAt);

    // Generate JWT token
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      console.error("[Token API] BETTER_AUTH_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create JWT with same expiration as session
    const token = jwt.sign(
      {
        sub: userId,                    // User ID (required by backend)
        email: row.email,               // User email
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
      secret,
      { algorithm: "HS256" }
    );

    return NextResponse.json({
      token,
      userId,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("[Token API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

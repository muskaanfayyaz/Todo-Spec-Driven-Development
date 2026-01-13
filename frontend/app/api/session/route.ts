/**
 * Custom Session API Route for Better Auth v1.4.10
 *
 * This endpoint retrieves the current session from Better Auth.
 * Better Auth v1.4.10 uses cookies for session management.
 */

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/session
 *
 * Returns the current authenticated session or null if not authenticated.
 * Reads session token from cookie and queries database.
 */
export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    // Query database for session
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Better Auth stores the session with a token field, not id
    // The cookie contains the token (before the signature part)
    const token = sessionToken.split('.')[0]; // Extract token before signature

    const sessionResult = await pool.query(
      `SELECT s.*, u.id as user_id, u.email, u.name, u."emailVerified", u.image, u."createdAt", u."updatedAt"
       FROM session s
       JOIN "user" u ON s."userId" = u.id
       WHERE s.token = $1 AND s."expiresAt" > NOW()`,
      [token]
    );

    await pool.end();

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const row = sessionResult.rows[0];

    return NextResponse.json({
      data: {
        user: {
          id: row.user_id,
          email: row.email,
          name: row.name,
          emailVerified: row.emailVerified,
          image: row.image,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
        session: {
          id: row.id,
          userId: row.userId,
          expiresAt: row.expiresAt,
          ipAddress: row.ipAddress,
          userAgent: row.userAgent,
        },
      },
    });
  } catch (error) {
    console.error("[Session API] Error:", error);
    return NextResponse.json({ data: null }, { status: 200 });
  }
}

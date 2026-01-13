/**
 * PostgreSQL Connection Pool Singleton
 *
 * This module creates a SINGLE connection pool that is reused across
 * all Next.js API requests. This eliminates the overhead of:
 * - Fresh connection establishment (4+ seconds)
 * - SSL/TLS handshake (0.7+ seconds)
 * - Connection authentication
 *
 * CRITICAL: This must be a singleton to work in Next.js serverless environment.
 */

import { Pool, PoolConfig } from 'pg';

/**
 * Global singleton pool instance.
 * Persists across hot reloads in development.
 */
let globalPool: Pool | undefined;

/**
 * Connection pool configuration optimized for Better Auth workload.
 */
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,

  // Pool size: Balance between connection overhead and concurrency
  // - Too low: Requests queue waiting for connections
  // - Too high: Wastes database resources
  // For auth workload (bursty, short-lived queries): 5-10 is optimal
  max: 10,                    // Maximum connections in pool
  min: 2,                     // Minimum idle connections (kept warm)

  // Connection lifetime management
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Fail fast if can't get connection in 10s

  // Keep-alive to prevent connection drops
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,

  // SSL configuration (required by Neon)
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true }  // Verify SSL cert in production
    : { rejectUnauthorized: false }, // Allow self-signed in dev

  // Statement timeout: Prevent runaway queries
  statement_timeout: 30000,   // Kill queries after 30s

  // Query timeout at client level
  query_timeout: 10000,       // Fail queries after 10s
};

/**
 * Get or create the singleton connection pool.
 *
 * In Next.js, API routes are recreated on each request in development
 * and potentially in serverless production. We use a global variable
 * to persist the pool across invocations.
 *
 * @returns Singleton PostgreSQL connection pool
 */
export function getPool(): Pool {
  if (!globalPool) {
    console.log('[DB Pool] Creating new PostgreSQL connection pool');
    console.log('[DB Pool] Configuration:', {
      max: poolConfig.max,
      min: poolConfig.min,
      host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
    });

    globalPool = new Pool(poolConfig);

    // Error handling: Log connection errors but don't crash
    globalPool.on('error', (err) => {
      console.error('[DB Pool] Unexpected error on idle client', err);
    });

    // Monitoring: Log when connections are added/removed
    globalPool.on('connect', (client) => {
      console.log('[DB Pool] New client connected. Total:', globalPool?.totalCount);
    });

    globalPool.on('remove', (client) => {
      console.log('[DB Pool] Client removed. Total:', globalPool?.totalCount);
    });
  }

  return globalPool;
}

/**
 * Get pool statistics for monitoring.
 * Useful for debugging connection pool issues.
 */
export function getPoolStats() {
  if (!globalPool) {
    return null;
  }

  return {
    total: globalPool.totalCount,
    idle: globalPool.idleCount,
    waiting: globalPool.waitingCount,
  };
}

/**
 * Gracefully close the connection pool.
 * Call this during application shutdown.
 */
export async function closePool(): Promise<void> {
  if (globalPool) {
    console.log('[DB Pool] Closing connection pool');
    await globalPool.end();
    globalPool = undefined;
  }
}

/**
 * Health check: Verify pool can acquire and release a connection.
 *
 * @returns true if pool is healthy, false otherwise
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const pool = getPool();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('[DB Pool] Health check failed:', error);
    return false;
  }
}

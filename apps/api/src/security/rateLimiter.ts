// ==========================================================
// GCC Portal — Rate Limiter (D1-backed)
// apps/api/src/security/rateLimiter.ts
// ==========================================================

import type { D1Database } from '@gcc-portal/database';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60; // 15 minutes

/** Loopback IPs are never rate-limited outside of production. */
const LOOPBACK_IPS = new Set(['127.0.0.1', '::1', 'localhost', 'unknown']);

function isLocalhostBypass(ip: string, appEnv?: string): boolean {
  return appEnv !== 'production' && LOOPBACK_IPS.has(ip);
}

export async function checkLoginRateLimit(
  db: D1Database,
  ip: string,
  appEnv?: string
): Promise<{ allowed: boolean; attemptsRemaining: number }> {
  if (isLocalhostBypass(ip, appEnv)) {
    return { allowed: true, attemptsRemaining: MAX_LOGIN_ATTEMPTS };
  }
  const windowStart = Math.floor(Date.now() / 1000) - LOGIN_WINDOW_SECONDS;

  const result = await db
    .prepare(
      `SELECT COUNT(*) as count FROM security_events
       WHERE event_type = 'LOGIN_ATTEMPT' AND ip_address = ? AND timestamp > ?`
    )
    .bind(ip, windowStart)
    .first<{ count: number }>();

  const count = result?.count ?? 0;
  const allowed = count < MAX_LOGIN_ATTEMPTS;
  const attemptsRemaining = Math.max(0, MAX_LOGIN_ATTEMPTS - count - 1);

  if (!allowed) {
    await db
      .prepare(
        `INSERT INTO security_events (id, timestamp, event_type, ip_address, details)
         VALUES (?, ?, 'RATE_LIMIT_EXCEEDED', ?, ?)`
      )
      .bind(
        crypto.randomUUID(),
        Math.floor(Date.now() / 1000),
        ip,
        JSON.stringify({ reason: 'Login rate limit exceeded' })
      )
      .run();
  }

  return { allowed, attemptsRemaining };
}

export async function recordLoginAttempt(db: D1Database, ip: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO security_events (id, timestamp, event_type, ip_address, details)
       VALUES (?, ?, 'LOGIN_ATTEMPT', ?, ?)`
    )
    .bind(
      crypto.randomUUID(),
      Math.floor(Date.now() / 1000),
      ip,
      JSON.stringify({ recorded: true })
    )
    .run();
}

/**
 * Generic sliding window rate limiter backed by D1.
 * Uses 1-second resolution keys to support high concurrency.
 */
export async function checkRateLimit(
  db: D1Database,
  key: string,
  maxRequests: number,
  windowSeconds: number,
  _appEnv?: string // reserved for future use — not used to ensure rate limit tests work
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  // Opportunistic cleanup of expired keys
  db.prepare('DELETE FROM rate_limit_entries WHERE key = ? AND window_start < ?')
    .bind(key, windowStart)
    .run();

  const result = await db
    .prepare('SELECT SUM(count) as total FROM rate_limit_entries WHERE key = ? AND window_start >= ?')
    .bind(key, windowStart)
    .first<{ total: number | null }>();

  const currentCount = result?.total ?? 0;

  if (currentCount >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count for current second
  await db
    .prepare(
      `INSERT INTO rate_limit_entries (key, window_start, count)
       VALUES (?, ?, 1)
       ON CONFLICT(key, window_start) DO UPDATE SET count = count + 1`
    )
    .bind(key, now)
    .run();

  return { allowed: true, remaining: maxRequests - currentCount - 1 };
}
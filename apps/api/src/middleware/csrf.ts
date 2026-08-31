// ==========================================================
// GCC Portal — CSRF Protection Middleware
// apps/api/src/middleware/csrf.ts
//
// Implements double-submit CSRF protection.
// - Tokens issued at GET /api/v1/auth/csrf-token (requires valid session)
// - Every state-changing authenticated request must supply X-CSRF-Token header
// - Public endpoints (event registration) are exempt — they use Turnstile instead
// ==========================================================

import type { MiddlewareHandler } from 'hono';
import type { Env } from '../types/env';

const TOKEN_TTL_SECONDS = 3600; // 1 hour
const EXEMPT_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/mfa/verify',
  '/api/v1/auth/csrf-token',
]);

/** Generate and store a new CSRF token for the given session. */
export async function issueCsrfToken(
  db: Env['DB'],
  sessionId: string
): Promise<string> {
  const rawToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const tokenHash = await sha256hex(rawToken);
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT OR REPLACE INTO csrf_tokens (token_hash, session_id, created_at, expires_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(tokenHash, sessionId, now, now + TOKEN_TTL_SECONDS)
    .run();

  // Clean up expired CSRF tokens (opportunistic, best-effort)
  db.prepare(`DELETE FROM csrf_tokens WHERE expires_at < ?`).bind(now).run();

  return rawToken;
}

/** Verify that a CSRF token is valid for the given session. */
async function verifyCsrfToken(
  db: Env['DB'],
  rawToken: string,
  sessionId: string
): Promise<boolean> {
  const tokenHash = await sha256hex(rawToken);
  const now = Math.floor(Date.now() / 1000);

  const row = await db
    .prepare(
      `SELECT 1 FROM csrf_tokens
       WHERE token_hash = ? AND session_id = ? AND expires_at > ?`
    )
    .bind(tokenHash, sessionId, now)
    .first();

  return row !== null;
}

async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * CSRF enforcement middleware.
 *
 * Rules:
 * - GET, HEAD, OPTIONS are always skipped (safe methods)
 * - Paths in EXEMPT_PATHS are skipped (login, public registration)
 * - All other state-changing methods (POST, PATCH, PUT, DELETE) require X-CSRF-Token
 *   if the request carries a session cookie.
 */
export const csrfMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const method = c.req.method.toUpperCase();

  // Safe HTTP methods — skip
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return next();
  }

  const path = new URL(c.req.url).pathname;

  // Public or auth-init paths — skip (they use Turnstile or have no session)
  if (EXEMPT_PATHS.has(path)) {
    return next();
  }

  // Only enforce on requests that carry a session cookie
  const cookieHeader = c.req.header('Cookie') ?? '';
  const hasSession = cookieHeader.includes('gcc_session=');
  if (!hasSession) {
    // Unauthenticated requests will be rejected by requireAuth anyway
    return next();
  }

  const csrfToken = c.req.header('X-CSRF-Token');
  if (!csrfToken) {
    return c.json(
      { success: false, error: { code: 'CSRF_MISSING', message: 'CSRF token required' } },
      403
    );
  }

  // Extract session id from cookie for lookup
  const sessionMatch = /gcc_session=([^;]+)/.exec(cookieHeader);
  const rawSessionToken = sessionMatch?.[1];
  if (!rawSessionToken) {
    return c.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'No session' } },
      401
    );
  }

  // Hash the session token to get the session ID (mirrors the auth layer)
  const sessionIdHash = await sha256hex(rawSessionToken);

  const valid = await verifyCsrfToken(c.env.DB, csrfToken, sessionIdHash);
  if (!valid) {
    return c.json(
      { success: false, error: { code: 'CSRF_INVALID', message: 'Invalid or expired CSRF token' } },
      403
    );
  }

  return next();
};

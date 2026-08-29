// ==========================================================
// GCC Portal — Rate Limit Middleware (Hono)
// apps/api/src/middleware/rateLimitMiddleware.ts
// ==========================================================

import type { MiddlewareHandler } from 'hono';
import type { Env } from '../types/env';
import { checkRateLimit } from '../security/rateLimiter';

export function rateLimiter(
  keyPrefix: string,
  maxRequests: number,
  windowSeconds: number
): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    const key = `${keyPrefix}:${ip}`;

    const { allowed, remaining } = await checkRateLimit(c.env.DB, key, maxRequests, windowSeconds);

    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());

    if (!allowed) {
      const now = Math.floor(Date.now() / 1000);
      // Log rate limit violation to security_events
      await c.env.DB
        .prepare(
          `INSERT INTO security_events (id, timestamp, event_type, ip_address, details)
           VALUES (?, ?, 'RATE_LIMIT_EXCEEDED', ?, ?)`
        )
        .bind(
          crypto.randomUUID(),
          now,
          ip,
          JSON.stringify({ path: c.req.path, limit: maxRequests, windowSeconds })
        )
        .run();

      return c.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        429
      );
    }

    return next();
  };
}

// ==========================================================
// GCC Portal — Structured Logging Middleware (Hono)
// apps/api/src/middleware/logger.ts
// ==========================================================

import type { MiddlewareHandler } from 'hono';
import type { Env } from '../types/env';

export const loggerMiddleware = (): MiddlewareHandler<{ Bindings: Env; Variables: { requestId: string } }> => {
  return async (c, next) => {
    const requestId = crypto.randomUUID();
    c.set('requestId', requestId);
    c.header('X-Request-ID', requestId);

    const method = c.req.method;
    const path = new URL(c.req.url).pathname;
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    const ua = c.req.header('User-Agent') ?? '';
    const start = Date.now();

    console.log(
      JSON.stringify({
        level: 'info',
        message: `Incoming ${method} ${path}`,
        requestId,
        method,
        path,
        ip,
        ua,
        timestamp: Math.floor(start / 1000),
      })
    );

    try {
      await next();
    } finally {
      const durationMs = Date.now() - start;
      const status = c.res.status;

      console.log(
        JSON.stringify({
          level: 'info',
          message: `Finished ${method} ${path} - ${status} (${durationMs}ms)`,
          requestId,
          method,
          path,
          status,
          durationMs,
          timestamp: Math.floor(Date.now() / 1000),
        })
      );
    }
  };
};

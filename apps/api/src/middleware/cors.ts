// ==========================================================
// GCC Portal — Security Headers & CORS Middleware
// apps/api/src/middleware/cors.ts
// ==========================================================

import { createMiddleware } from 'hono/factory';
import type { Env } from '../types/env';

export const corsAndHeaders = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const origin = c.req.header('Origin') ?? '';
  const allowedOrigins = (c.env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim());

  // Always set Vary to prevent cache poisoning across origins
  c.header('Vary', 'Origin');

  if (allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With,X-CSRF-Token');
  }

  // Preflight request handler
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  // Security Headers for JSON APIs
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  await next();
});
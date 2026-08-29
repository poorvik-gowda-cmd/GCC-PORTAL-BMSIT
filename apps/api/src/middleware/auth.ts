// ==========================================================
// GCC Portal — Auth & Permission Middleware (Hono)
// apps/api/src/middleware/auth.ts
// ==========================================================

import { createMiddleware } from 'hono/factory';
import type { Env } from '../types/env';
import type { Permission, UserProfile } from '@gcc-portal/contracts';
import { validateSession } from '../services/authService';
import { auditLog } from '../services/auditService';

export type AuthVariables = {
  user: UserProfile;
};

const SESSION_COOKIE = 'gcc_session';

function getSessionToken(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...v] = c.trim().split('=');
      return [key?.trim() ?? '', v.join('=').trim()];
    })
  );
  return cookies[SESSION_COOKIE] ?? null;
}

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(
  async (c, next) => {
    const token = getSessionToken(c.req.raw);
    if (!token) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }

    const user = await validateSession(c.env.DB, token);
    if (!user) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session' } }, 401);
    }

    c.set('user', user);
    await next();
  }
);

export function requirePermission(permission: Permission) {
  return createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }

    if (!user.permissions.includes(permission)) {
      const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? '';
      await auditLog(
        c.env.DB,
        user.id,
        'PERMISSION_DENIED',
        { permission, path: c.req.path },
        ip,
        c.req.header('User-Agent') ?? ''
      );
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' } },
        403
      );
    }

    await next();
  });
}
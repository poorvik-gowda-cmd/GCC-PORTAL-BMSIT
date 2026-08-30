// ==========================================================
// GCC Portal — Auth Routes with Admin MFA & Password Reset
// apps/api/src/routes/auth.ts
// ==========================================================

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { AuthVariables } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { loginUser, logoutUser, loadUserProfile } from '../services/authService';
import { generateResetToken, generateSessionToken, hashPassword, sha256Hex } from '../security/crypto';
import { generateBase32Secret, verifyTOTP, generateRecoveryCodes, buildOtpauthUrl } from '../security/totp';
import { auditLog } from '../services/auditService';
import { issueCsrfToken } from '../middleware/csrf';
import { rateLimiter } from '../middleware/rateLimitMiddleware';
import { LoginRequestSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@gcc-portal/contracts';

type Variables = AuthVariables;
const SESSION_COOKIE = 'gcc_session';
const SESSION_TTL = 24 * 60 * 60;
const RESET_TOKEN_TTL = 15 * 60;

export const authRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/v1/auth/login
authRouter.post('/login', zValidator('json', LoginRequestSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
  const userAgent = c.req.header('User-Agent') ?? '';

  const result = await loginUser(c.env.DB, email, password, ip, userAgent, c.env.APP_ENV);

  if ('requiresMfa' in result && result.requiresMfa) {
    return c.json({ success: true, data: { requiresMfa: true, mfaSessionToken: result.mfaSessionToken } });
  }

  if (!result.success) {
    const statusMap: Record<string, number> = {
      RATE_LIMITED: 429,
      INVALID_CREDENTIALS: 401,
      ACCOUNT_SUSPENDED: 403,
      ACCOUNT_REVOKED: 403,
      PENDING_SETUP: 403,
    };
    const messageMap: Record<string, string> = {
      RATE_LIMITED: 'Too many login attempts. Try again in 15 minutes.',
      INVALID_CREDENTIALS: 'Invalid email or password.',
      ACCOUNT_SUSPENDED: 'Your account has been suspended. Contact the administrator.',
      ACCOUNT_REVOKED: 'Your account access has been revoked.',
      PENDING_SETUP: 'Please complete your account setup before logging in.',
    };

    return c.json(
      { success: false, error: { code: result.error, message: messageMap[result.error] ?? 'Login failed' } },
      (statusMap[result.error] ?? 400) as 400 | 401 | 403 | 429
    );
  }

  const isProd = c.env.APP_ENV === 'production';
  c.header(
    'Set-Cookie',
    `${SESSION_COOKIE}=${result.sessionToken}; HttpOnly; ${isProd ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`
  );

  return c.json({ success: true, data: { user: result.user } }, 200);
});

// GET /api/v1/auth/csrf-token — Issue CSRF token for authenticated session
authRouter.get('/csrf-token', requireAuth, async (c) => {
  // Extract session cookie to derive the session ID
  const cookieHeader = c.req.header('cookie') ?? '';
  const sessionMatch = /gcc_session=([^;]+)/.exec(cookieHeader);
  const rawSessionToken = sessionMatch?.[1];
  if (!rawSessionToken) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No session' } }, 401);
  }
  const sessionId = await sha256Hex(rawSessionToken);
  const csrfToken = await issueCsrfToken(c.env.DB, sessionId);
  return c.json({ success: true, data: { csrfToken } });
});

// POST /api/v1/auth/mfa/verify — MFA Step 2 Verification
authRouter.post(
  '/mfa/verify',
  rateLimiter('mfa_verify', 5, 300), // 5 attempts per 5 min per IP — prevents TOTP brute-force
  zValidator(
    'json',
    z.object({
      mfaSessionToken: z.string().min(1),
      totpCode: z.string().optional(),
      recoveryCode: z.string().optional(),
    }).refine((d) => d.totpCode || d.recoveryCode, { message: 'Either totpCode or recoveryCode is required' })
  ),
  async (c) => {
    const { mfaSessionToken, totpCode, recoveryCode } = c.req.valid('json');
    const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
    const ua = c.req.header('User-Agent') ?? '';
    const now = Math.floor(Date.now() / 1000);

    const hashedMfaToken = await sha256Hex(mfaSessionToken);
    const mfaSession = await c.env.DB
      .prepare('SELECT * FROM mfa_sessions WHERE id = ? AND expires_at > ?')
      .bind(hashedMfaToken, now)
      .first<{ id: string; user_id: string }>();

    if (!mfaSession) {
      return c.json({ success: false, error: { code: 'INVALID_TOKEN', message: 'MFA session expired or invalid. Please log in again.' } }, 401);
    }

    const user = await c.env.DB
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(mfaSession.user_id)
      .first<{ id: string; email: string; full_name: string; account_status: string; mfa_secret: string }>();

    if (!user) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
    }

    let verified = false;

    if (totpCode && user.mfa_secret) {
      verified = await verifyTOTP(user.mfa_secret, totpCode);
    } else if (recoveryCode) {
      const codeHash = await sha256Hex(recoveryCode.trim().toUpperCase());
      const recRecord = await c.env.DB
        .prepare('SELECT * FROM user_recovery_codes WHERE user_id = ? AND code_hash = ? AND used_at IS NULL')
        .bind(user.id, codeHash)
        .first<{ id: string }>();

      if (recRecord) {
        verified = true;
        await c.env.DB.prepare('UPDATE user_recovery_codes SET used_at = ? WHERE id = ?').bind(now, recRecord.id).run();
        await auditLog(c.env.DB, user.id, 'ADMIN_ACTION', { action: 'mfa_recovery_code_used' }, ip, ua);
      }
    }

    if (!verified) {
      await auditLog(c.env.DB, user.id, 'LOGIN_FAILURE', { reason: 'MFA code invalid' }, ip, ua);
      return c.json({ success: false, error: { code: 'INVALID_MFA_CODE', message: 'Invalid verification code' } }, 400);
    }

    // Delete temporary MFA session
    await c.env.DB.prepare('DELETE FROM mfa_sessions WHERE id = ?').bind(hashedMfaToken).run();

    // Create full authenticated session
    const sessionToken = generateSessionToken();
    const sessionId = await sha256Hex(sessionToken);
    const expiresAt = now + SESSION_TTL;

    await c.env.DB
      .prepare(
        `INSERT INTO sessions (id, user_id, expires_at, created_at, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(sessionId, user.id, expiresAt, now, ip, ua)
      .run();

    const profile = await loadUserProfile(c.env.DB, user as any);

    const isProd = c.env.APP_ENV === 'production';
    c.header(
      'Set-Cookie',
      `${SESSION_COOKIE}=${sessionToken}; HttpOnly; ${isProd ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`
    );

    await auditLog(c.env.DB, user.id, 'LOGIN_SUCCESS', { step: 'mfa_verified' }, ip, ua);

    return c.json({ success: true, data: { user: profile } });
  }
);

// POST /api/v1/auth/mfa/setup — Generate TOTP Secret (Authenticated)
authRouter.post('/mfa/setup', requireAuth, async (c) => {
  const user = c.get('user');
  const secret = generateBase32Secret();
  const otpauthUrl = buildOtpauthUrl(user.email, secret);

  await c.env.DB
    .prepare('UPDATE users SET mfa_secret = ? WHERE id = ?')
    .bind(secret, user.id)
    .run();

  return c.json({ success: true, data: { secret, otpauthUrl } });
});

// POST /api/v1/auth/mfa/enable — Verify Code and Enable MFA (Authenticated)
authRouter.post(
  '/mfa/enable',
  requireAuth,
  zValidator('json', z.object({ code: z.string().length(6) })),
  async (c) => {
    const user = c.get('user');
    const { code } = c.req.valid('json');
    const ip = c.req.header('CF-Connecting-IP') ?? '';
    const ua = c.req.header('User-Agent') ?? '';
    const now = Math.floor(Date.now() / 1000);

    const dbUser = await c.env.DB
      .prepare('SELECT mfa_secret FROM users WHERE id = ?')
      .bind(user.id)
      .first<{ mfa_secret: string }>();

    if (!dbUser?.mfa_secret) {
      return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'MFA setup not initiated' } }, 400);
    }

    const isValid = await verifyTOTP(dbUser.mfa_secret, code);
    if (!isValid) {
      return c.json({ success: false, error: { code: 'INVALID_MFA_CODE', message: 'Invalid verification code' } }, 400);
    }

    const { plainCodes, hashedCodes } = await generateRecoveryCodes(8);

    await c.env.DB.prepare('UPDATE users SET mfa_enabled = 1, mfa_enrolled_at = ? WHERE id = ?').bind(now, user.id).run();

    // Delete existing recovery codes if any
    await c.env.DB.prepare('DELETE FROM user_recovery_codes WHERE user_id = ?').bind(user.id).run();

    for (const codeHash of hashedCodes) {
      await c.env.DB
        .prepare('INSERT INTO user_recovery_codes (id, user_id, code_hash, created_at) VALUES (?, ?, ?, ?)')
        .bind(crypto.randomUUID(), user.id, codeHash, now)
        .run();
    }

    await auditLog(c.env.DB, user.id, 'ADMIN_ACTION', { action: 'mfa_enabled' }, ip, ua);

    return c.json({ success: true, data: { message: 'MFA enabled successfully.', recoveryCodes: plainCodes } });
  }
);

// POST /api/v1/auth/forgot-password
authRouter.post('/forgot-password', zValidator('json', ForgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json');
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const ua = c.req.header('User-Agent') ?? '';
  const now = Math.floor(Date.now() / 1000);

  const rateCheck = await c.env.DB
    .prepare(
      `SELECT COUNT(*) as count FROM security_events
       WHERE event_type = 'FORGOT_PASSWORD_REQUEST' AND ip_address = ? AND timestamp > ?`
    )
    .bind(ip, now - 900)
    .first<{ count: number }>();

  if ((rateCheck?.count ?? 0) >= 3) {
    return c.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Too many password reset attempts. Try again in 15 minutes.' } },
      429
    );
  }

  await c.env.DB
    .prepare(
      `INSERT INTO security_events (id, timestamp, event_type, ip_address, details)
       VALUES (?, ?, 'FORGOT_PASSWORD_REQUEST', ?, ?)`
    )
    .bind(crypto.randomUUID(), now, ip, JSON.stringify({ email: email.toLowerCase() }))
    .run();

  const user = await c.env.DB
    .prepare('SELECT id, account_status FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first<{ id: string; account_status: string }>();

  if (user && user.account_status === 'ACTIVE') {
    const { token, tokenHash } = await generateResetToken();
    const expiresAt = now + RESET_TOKEN_TTL;

    await c.env.DB
      .prepare(
        `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .bind(tokenHash, user.id, expiresAt, now)
      .run();

    await auditLog(c.env.DB, user.id, 'PASSWORD_RESET', { action: 'token_generated' }, ip, ua);
  }

  return c.json({
    success: true,
    data: { message: 'If an account exists for this email, password reset instructions have been issued.' },
  });
});

// POST /api/v1/auth/reset-password
authRouter.post(
  '/reset-password',
  rateLimiter('reset_pwd', 5, 900), // 5 attempts per 15 min per IP — prevents token brute-force
  zValidator('json', ResetPasswordSchema),
  async (c) => {
  const { token, newPassword } = c.req.valid('json');
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const ua = c.req.header('User-Agent') ?? '';
  const now = Math.floor(Date.now() / 1000);

  const tokenHash = await sha256Hex(token);

  const resetRecord = await c.env.DB
    .prepare(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`
    )
    .bind(tokenHash, now)
    .first<{ token_hash: string; user_id: string; expires_at: number }>();

  if (!resetRecord) {
    return c.json(
      { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired password reset token' } },
      400
    );
  }

  const newHash = await hashPassword(newPassword);

  await c.env.DB
    .prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
    .bind(newHash, now, resetRecord.user_id)
    .run();

  await c.env.DB
    .prepare('UPDATE password_reset_tokens SET used_at = ? WHERE token_hash = ?')
    .bind(now, tokenHash)
    .run();

  await c.env.DB
    .prepare('DELETE FROM sessions WHERE user_id = ?')
    .bind(resetRecord.user_id)
    .run();

  await auditLog(c.env.DB, resetRecord.user_id, 'PASSWORD_RESET', { action: 'password_updated' }, ip, ua);

  return c.json({ success: true, data: { message: 'Password updated successfully. Please log in with your new password.' } });
  }
);

// POST /api/v1/auth/logout
authRouter.post('/logout', requireAuth, async (c) => {
  const user = c.get('user');
  const cookieHeader = c.req.header('cookie') ?? '';
  const token = cookieHeader
    .split(';')
    .find((c) => c.trim().startsWith(`${SESSION_COOKIE}=`))
    ?.split('=')[1]
    ?.trim();

  if (token) {
    const ip = c.req.header('CF-Connecting-IP') ?? '';
    const ua = c.req.header('User-Agent') ?? '';
    await logoutUser(c.env.DB, token, user.id, ip, ua);
  }

  c.header('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  return c.json({ success: true, data: null });
});

// GET /api/v1/auth/me
authRouter.get('/me', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ success: true, data: { user } });
});
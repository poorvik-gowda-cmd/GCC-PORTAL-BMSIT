// ==========================================================
// GCC Portal — Auth Service with MFA Support
// apps/api/src/services/authService.ts
// ==========================================================

import type { D1Database, DbUser, DbSession } from '@gcc-portal/database';
import type { UserProfile, Permission, RoleId, DepartmentId } from '@gcc-portal/contracts';
import { hashPassword, verifyPassword, generateSessionToken, sha256Hex } from '../security/crypto';
import { checkLoginRateLimit, recordLoginAttempt } from '../security/rateLimiter';
import { auditLog } from './auditService';

const SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const MFA_SESSION_TTL_SECONDS = 5 * 60; // 5 minutes

export type AuthError =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_REVOKED'
  | 'PENDING_SETUP'
  | 'RATE_LIMITED'
  | 'NOT_FOUND';

export interface LoginResultSuccess {
  success: true;
  sessionToken: string;
  user: UserProfile;
}

export interface LoginResultMfaRequired {
  success: false;
  requiresMfa: true;
  mfaSessionToken: string;
}

export interface LoginFailure {
  success: false;
  requiresMfa?: false;
  error: AuthError;
}

export type LoginResponse = LoginResultSuccess | LoginResultMfaRequired | LoginFailure;

export async function loginUser(
  db: D1Database,
  email: string,
  password: string,
  ip: string,
  userAgent: string,
  appEnv?: string
): Promise<LoginResponse> {
  const { allowed } = await checkLoginRateLimit(db, ip, appEnv);
  if (!allowed) {
    return { success: false, error: 'RATE_LIMITED' };
  }

  await recordLoginAttempt(db, ip);

  const user = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first<DbUser & { mfa_enabled?: number; mfa_secret?: string }>();

  if (!user) {
    await auditLog(db, null, 'LOGIN_FAILURE', { reason: 'Unknown email', email }, ip, userAgent);
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    await auditLog(db, user.id, 'LOGIN_FAILURE', { reason: 'Wrong password' }, ip, userAgent);
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }

  if (user.account_status === 'SUSPENDED') {
    await auditLog(db, user.id, 'LOGIN_FAILURE', { reason: 'Account suspended' }, ip, userAgent);
    return { success: false, error: 'ACCOUNT_SUSPENDED' };
  }
  if (user.account_status === 'REVOKED') {
    await auditLog(db, user.id, 'LOGIN_FAILURE', { reason: 'Account revoked' }, ip, userAgent);
    return { success: false, error: 'ACCOUNT_REVOKED' };
  }
  if (user.account_status === 'PENDING_PASSWORD_SETUP') {
    return { success: false, error: 'PENDING_SETUP' };
  }

  const profile = await loadUserProfile(db, user);

  // MFA requirement is removed per user request for simpler portal access.
  // We issue the full session token immediately.

  // Issue full session token if MFA not required
  const sessionToken = generateSessionToken();
  const sessionId = await sha256Hex(sessionToken);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_TTL_SECONDS;

  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, expires_at, created_at, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(sessionId, user.id, expiresAt, now, ip, userAgent)
    .run();

  await db
    .prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?')
    .bind(now, now, user.id)
    .run();

  await auditLog(db, user.id, 'LOGIN_SUCCESS', { email: user.email }, ip, userAgent);

  return { success: true, sessionToken, user: profile };
}

export async function validateSession(
  db: D1Database,
  sessionToken: string
): Promise<UserProfile | null> {
  const now = Math.floor(Date.now() / 1000);
  const sessionId = await sha256Hex(sessionToken);

  const session = await db
    .prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?')
    .bind(sessionId, now)
    .first<DbSession>();

  if (!session) return null;

  const user = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(session.user_id)
    .first<DbUser>();

  if (!user || user.account_status === 'REVOKED' || user.account_status === 'SUSPENDED') {
    return null;
  }

  return loadUserProfile(db, user);
}

export async function logoutUser(
  db: D1Database,
  sessionToken: string,
  userId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  const sessionId = await sha256Hex(sessionToken);
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
  await auditLog(db, userId, 'LOGOUT', {}, ip, userAgent);
}

async function loadUserProfile(db: D1Database, user: DbUser): Promise<UserProfile> {
  const [rolesResult, deptsResult] = await Promise.all([
    db
      .prepare('SELECT role_id FROM user_roles WHERE user_id = ?')
      .bind(user.id)
      .all<{ role_id: string }>(),
    db
      .prepare('SELECT department_id FROM user_departments WHERE user_id = ?')
      .bind(user.id)
      .all<{ department_id: string }>(),
  ]);

  const roles = rolesResult.results.map((r: { role_id: string }) => r.role_id as RoleId);
  const departments = deptsResult.results.map((d: { department_id: string }) => d.department_id as DepartmentId);

  let permissions: Permission[] = [];
  if (roles.length > 0) {
    const placeholders = roles.map(() => '?').join(',');
    const permsResult = await db
      .prepare(
        `SELECT DISTINCT rp.permission_id
         FROM role_permissions rp
         WHERE rp.role_id IN (${placeholders})`
      )
      .bind(...roles)
      .all<{ permission_id: string }>();

    permissions = permsResult.results.map((p: { permission_id: string }) => p.permission_id as Permission);
  }

  // Department-specific permission adjustments based on GCC Portal governance rules:

  // 1. TECHNICAL Department: Full technical event management access
  if (departments.includes('TECHNICAL')) {
    const techPerms: Permission[] = [
      'EVENT_CREATE',
      'EVENT_EDIT',
      'EVENT_PUBLISH',
      'REGISTRATION_VIEW',
      'REGISTRATION_EXPORT',
      'QR_GENERATE',
      'TASK_VIEW_DEPARTMENT',
      'TASK_UPDATE_OWN',
    ];
    for (const p of techPerms) {
      if (!permissions.includes(p)) permissions.push(p);
    }
  }

  // 2. EVENTS_OPERATIONS Department: View registered candidates, attendance, and feedback forms.
  // NO event creation, editing, or publishing access.
  if (departments.includes('EVENTS_OPERATIONS') && !roles.includes('EXECUTIVE_COUNCIL') && !roles.includes('SYSTEM_SUPER_ADMIN')) {
    const opsPerms: Permission[] = [
      'REGISTRATION_VIEW',
      'REGISTRATION_EXPORT',
      'ATTENDANCE_MANAGE',
      'FEEDBACK_VIEW',
      'TASK_VIEW_DEPARTMENT',
      'TASK_UPDATE_OWN',
    ];
    for (const p of opsPerms) {
      if (!permissions.includes(p)) permissions.push(p);
    }
    // Explicitly strip event creation and modification rights
    permissions = permissions.filter((p) => !['EVENT_CREATE', 'EVENT_EDIT', 'EVENT_PUBLISH'].includes(p));
  }

  // 3. MARKETING Department: View upcoming events and generate/download QR codes for marketing.
  // NO event creation, editing, or publishing access.
  if (departments.includes('MARKETING') && !roles.includes('EXECUTIVE_COUNCIL') && !roles.includes('SYSTEM_SUPER_ADMIN')) {
    const mktPerms: Permission[] = [
      'QR_GENERATE',
      'TASK_VIEW_DEPARTMENT',
      'TASK_UPDATE_OWN',
    ];
    for (const p of mktPerms) {
      if (!permissions.includes(p)) permissions.push(p);
    }
    // Explicitly strip event creation and modification rights
    permissions = permissions.filter((p) => !['EVENT_CREATE', 'EVENT_EDIT', 'EVENT_PUBLISH'].includes(p));
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    accountStatus: user.account_status as UserProfile['accountStatus'],
    profilePhotoReference: user.profile_photo_reference,
    roles,
    departments,
    permissions,
    lastLoginAt: user.last_login_at,
  };
}

export { loadUserProfile };
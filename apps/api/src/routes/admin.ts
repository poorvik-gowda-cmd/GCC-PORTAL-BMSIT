// ==========================================================
// GCC Portal — Super Admin Management Routes
// apps/api/src/routes/admin.ts
// ==========================================================

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createMiddleware } from 'hono/factory';
import type { Env } from '../types/env';
import type { AuthVariables } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { hashPassword } from '../security/crypto';
import { auditLog } from '../services/auditService';
import type { RoleId, DepartmentId, AccountStatus } from '@gcc-portal/contracts';

type Variables = AuthVariables;

export const adminRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware: strictly require authenticated SYSTEM_SUPER_ADMIN role
const requireSuperAdmin = createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(
  async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
    }
    if (!user.roles.includes('SYSTEM_SUPER_ADMIN')) {
      const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? '';
      await auditLog(
        c.env.DB,
        user.id,
        'PERMISSION_DENIED',
        { action: 'super_admin_access_attempt', path: c.req.path },
        ip,
        c.req.header('User-Agent') ?? ''
      );
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Super Admin access required' } },
        403
      );
    }
    await next();
  }
);

// Protect all admin endpoints with requireAuth AND requireSuperAdmin
adminRouter.use('*', requireAuth);
adminRouter.use('*', requireSuperAdmin);

// ----------------------------------------------------------
// 1. GET /api/v1/admin/users — List & Search Users
// ----------------------------------------------------------
adminRouter.get('/users', async (c) => {
  const url = new URL(c.req.url);
  const q = url.searchParams.get('q')?.toLowerCase().trim() || '';
  const departmentFilter = url.searchParams.get('department')?.trim() || '';
  const roleFilter = url.searchParams.get('role')?.trim() || '';
  const statusFilter = url.searchParams.get('status')?.trim() || '';

  const rows = await c.env.DB.prepare(
    `SELECT 
       u.id, u.email, u.full_name, u.account_status, u.created_at, u.updated_at, u.last_login_at,
       (SELECT GROUP_CONCAT(role_id, ',') FROM user_roles WHERE user_id = u.id) as roles_csv,
       (SELECT GROUP_CONCAT(department_id, ',') FROM user_departments WHERE user_id = u.id) as departments_csv
     FROM users u
     ORDER BY u.created_at DESC`
  ).all<{
    id: string;
    email: string;
    full_name: string;
    account_status: string;
    created_at: number;
    updated_at: number;
    last_login_at: number | null;
    roles_csv: string | null;
    departments_csv: string | null;
  }>();

  let users = rows.results.map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    accountStatus: r.account_status as AccountStatus,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    lastLoginAt: r.last_login_at,
    roles: (r.roles_csv ? r.roles_csv.split(',').filter(Boolean) : []) as RoleId[],
    departments: (r.departments_csv ? r.departments_csv.split(',').filter(Boolean) : []) as DepartmentId[],
  }));

  if (q) {
    users = users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q)
    );
  }
  if (departmentFilter) {
    users = users.filter((u) => u.departments.includes(departmentFilter as DepartmentId));
  }
  if (roleFilter) {
    users = users.filter((u) => u.roles.includes(roleFilter as RoleId));
  }
  if (statusFilter) {
    users = users.filter((u) => u.accountStatus === statusFilter);
  }

  return c.json({ success: true, data: { users, count: users.length } });
});

// ----------------------------------------------------------
// 2. GET /api/v1/admin/users/:id — Get User Details
// ----------------------------------------------------------
adminRouter.get('/users/:id', async (c) => {
  const targetId = c.req.param('id');
  const userRow = await c.env.DB.prepare(
    `SELECT id, email, full_name, account_status, created_at, updated_at, last_login_at
     FROM users WHERE id = ? OR email = ?`
  )
    .bind(targetId, targetId.toLowerCase().trim())
    .first<{
      id: string;
      email: string;
      full_name: string;
      account_status: string;
      created_at: number;
      updated_at: number;
      last_login_at: number | null;
    }>();

  if (!userRow) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
  }

  const [rolesResult, deptsResult, sessionsResult] = await Promise.all([
    c.env.DB.prepare('SELECT role_id FROM user_roles WHERE user_id = ?').bind(userRow.id).all<{ role_id: string }>(),
    c.env.DB.prepare('SELECT department_id FROM user_departments WHERE user_id = ?').bind(userRow.id).all<{ department_id: string }>(),
    c.env.DB.prepare('SELECT COUNT(*) as active_sessions FROM sessions WHERE user_id = ? AND expires_at > ?')
      .bind(userRow.id, Math.floor(Date.now() / 1000))
      .first<{ active_sessions: number }>(),
  ]);

  const user = {
    id: userRow.id,
    email: userRow.email,
    fullName: userRow.full_name,
    accountStatus: userRow.account_status as AccountStatus,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
    lastLoginAt: userRow.last_login_at,
    roles: rolesResult.results.map((r) => r.role_id as RoleId),
    departments: deptsResult.results.map((d) => d.department_id as DepartmentId),
    activeSessions: sessionsResult?.active_sessions ?? 0,
  };

  return c.json({ success: true, data: { user } });
});

// ----------------------------------------------------------
// 3. POST /api/v1/admin/users — Create/Onboard Member
// ----------------------------------------------------------
const CreateMemberSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  password: z.string().min(8).optional(),
  departmentId: z.string().optional(),
  departmentIds: z.array(z.string()).optional(),
  roleId: z.string().optional(),
  accountStatus: z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED', 'PENDING_PASSWORD_SETUP']).optional(),
});

adminRouter.post('/users', zValidator('json', CreateMemberSchema), async (c) => {
  const adminUser = c.get('user');
  const body = c.req.valid('json');
  const normalizedEmail = body.email.toLowerCase().trim();
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';
  const now = Math.floor(Date.now() / 1000);

  // Check if user with this email already exists
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(normalizedEmail).first<{ id: string }>();
  if (existing) {
    return c.json({ success: false, error: { code: 'DUPLICATE_EMAIL', message: 'A user with this email already exists' } }, 409);
  }

  // Support array of departments
  const deptsToAssign: string[] = body.departmentIds && body.departmentIds.length > 0
    ? body.departmentIds
    : body.departmentId ? [body.departmentId] : [];

  // Validate role if provided
  const roleToAssign = body.roleId || 'DEPARTMENT_MEMBER';
  const roleExists = await c.env.DB.prepare('SELECT id FROM roles WHERE id = ?').bind(roleToAssign).first();
  if (!roleExists) {
    return c.json({ success: false, error: { code: 'INVALID_ROLE', message: 'Specified role does not exist' } }, 400);
  }

  const userId = `USER-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const initialPassword = body.password || 'GccPortal@2026!';
  const passwordHash = await hashPassword(initialPassword);
  const accountStatus = body.accountStatus || 'ACTIVE';

  const deptInsertStmts = deptsToAssign.map((dId) =>
    c.env.DB.prepare(`INSERT INTO user_departments (user_id, department_id) VALUES (?, ?)`).bind(userId, dId)
  );

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO users (id, email, full_name, password_hash, account_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(userId, normalizedEmail, body.fullName.trim(), passwordHash, accountStatus, now, now),
    c.env.DB.prepare(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`
    ).bind(userId, roleToAssign),
    ...deptInsertStmts,
  ]);

  await auditLog(
    c.env.DB,
    adminUser.id,
    'ADMIN_ACTION',
    { action: 'user_created', targetUserId: userId, email: normalizedEmail, role: roleToAssign, departments: deptsToAssign },
    ip,
    ua
  );

  return c.json(
    {
      success: true,
      data: {
        user: {
          id: userId,
          email: normalizedEmail,
          fullName: body.fullName.trim(),
          accountStatus,
          roles: [roleToAssign as RoleId],
          departments: deptsToAssign as DepartmentId[],
        },
        message: 'Member successfully onboarded.',
      },
    },
    201
  );
});

// ----------------------------------------------------------
// 4. POST /api/v1/admin/users/:id/department — Assign / Change Departments
// ----------------------------------------------------------
const AssignDepartmentSchema = z.object({
  departmentId: z.string().optional(),
  departments: z.array(z.string()).optional(),
});

adminRouter.post('/users/:id/department', zValidator('json', AssignDepartmentSchema), async (c) => {
  const adminUser = c.get('user');
  const targetId = c.req.param('id');
  const body = c.req.valid('json');
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';
  const now = Math.floor(Date.now() / 1000);

  const deptsToAssign: string[] = body.departments && body.departments.length > 0
    ? body.departments
    : body.departmentId ? [body.departmentId] : [];

  const user = await c.env.DB.prepare('SELECT id, email FROM users WHERE id = ?').bind(targetId).first<{ id: string; email: string }>();
  if (!user) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
  }

  const deleteStmt = c.env.DB.prepare('DELETE FROM user_departments WHERE user_id = ?').bind(user.id);
  const insertStmts = deptsToAssign.map((dId) =>
    c.env.DB.prepare('INSERT INTO user_departments (user_id, department_id) VALUES (?, ?)').bind(user.id, dId)
  );
  const updateStmt = c.env.DB.prepare('UPDATE users SET updated_at = ? WHERE id = ?').bind(now, user.id);

  await c.env.DB.batch([deleteStmt, ...insertStmts, updateStmt]);

  await auditLog(
    c.env.DB,
    adminUser.id,
    'DEPARTMENT_CHANGED',
    { targetUserId: user.id, targetEmail: user.email, newDepartments: deptsToAssign },
    ip,
    ua
  );

  return c.json({
    success: true,
    data: {
      userId: user.id,
      departments: deptsToAssign,
      message: `Departments updated successfully.`,
    },
  });
});

// ----------------------------------------------------------
// 5. POST /api/v1/admin/users/:id/roles — Assign / Change Roles
// ----------------------------------------------------------
const AssignRolesSchema = z.object({
  roles: z.array(z.string()).min(1),
});

adminRouter.post('/users/:id/roles', zValidator('json', AssignRolesSchema), async (c) => {
  const adminUser = c.get('user');
  const targetId = c.req.param('id');
  const { roles } = c.req.valid('json');
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';
  const now = Math.floor(Date.now() / 1000);

  const user = await c.env.DB.prepare('SELECT id, email FROM users WHERE id = ?').bind(targetId).first<{ id: string; email: string }>();
  if (!user) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
  }

  // Validate all roles exist
  const existingRoles = await c.env.DB.prepare('SELECT id FROM roles').all<{ id: string }>();
  const validRoleIds = new Set(existingRoles.results.map((r) => r.id));
  for (const r of roles) {
    if (!validRoleIds.has(r)) {
      return c.json({ success: false, error: { code: 'INVALID_ROLE', message: `Invalid role: ${r}` } }, 400);
    }
  }

  const deleteStmt = c.env.DB.prepare('DELETE FROM user_roles WHERE user_id = ?').bind(user.id);
  const insertStmts = roles.map((r) =>
    c.env.DB.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)').bind(user.id, r)
  );
  const updateStmt = c.env.DB.prepare('UPDATE users SET updated_at = ? WHERE id = ?').bind(now, user.id);

  await c.env.DB.batch([deleteStmt, ...insertStmts, updateStmt]);

  await auditLog(
    c.env.DB,
    adminUser.id,
    'ROLE_CHANGED',
    { targetUserId: user.id, targetEmail: user.email, newRoles: roles },
    ip,
    ua
  );

  return c.json({
    success: true,
    data: {
      userId: user.id,
      roles: roles as RoleId[],
      message: 'Roles updated successfully.',
    },
  });
});

// ----------------------------------------------------------
// 6. POST /api/v1/admin/users/:id/status — Activate / Suspend / Revoke Account
// ----------------------------------------------------------
const UpdateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED', 'PENDING_PASSWORD_SETUP']),
});

adminRouter.post('/users/:id/status', zValidator('json', UpdateStatusSchema), async (c) => {
  const adminUser = c.get('user');
  const targetId = c.req.param('id');
  const { status } = c.req.valid('json');
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';
  const now = Math.floor(Date.now() / 1000);

  const user = await c.env.DB.prepare('SELECT id, email, account_status FROM users WHERE id = ?').bind(targetId).first<{ id: string; email: string; account_status: string }>();
  if (!user) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
  }

  const queries = [
    c.env.DB.prepare('UPDATE users SET account_status = ?, updated_at = ? WHERE id = ?').bind(status, now, user.id),
  ];

  // If suspending or revoking, invalidate all active sessions
  if (status === 'SUSPENDED' || status === 'REVOKED') {
    queries.push(c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id));
  }

  await c.env.DB.batch(queries);

  await auditLog(
    c.env.DB,
    adminUser.id,
    'ADMIN_ACTION',
    { action: 'account_status_changed', targetUserId: user.id, targetEmail: user.email, oldStatus: user.account_status, newStatus: status },
    ip,
    ua
  );

  return c.json({
    success: true,
    data: {
      userId: user.id,
      status: status as AccountStatus,
      message: `Account status updated to ${status}.`,
    },
  });
});

// ----------------------------------------------------------
// 7. POST /api/v1/admin/users/:id/revoke-sessions — Revoke All User Sessions
// ----------------------------------------------------------
adminRouter.post('/users/:id/revoke-sessions', async (c) => {
  const adminUser = c.get('user');
  const targetId = c.req.param('id');
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';

  const user = await c.env.DB.prepare('SELECT id, email FROM users WHERE id = ?').bind(targetId).first<{ id: string; email: string }>();
  if (!user) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
  }

  const result = await c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id).run();

  await auditLog(
    c.env.DB,
    adminUser.id,
    'ADMIN_ACTION',
    { action: 'sessions_revoked', targetUserId: user.id, targetEmail: user.email, deletedCount: result.meta.changes },
    ip,
    ua
  );

  return c.json({
    success: true,
    data: {
      userId: user.id,
      revokedCount: result.meta.changes,
      message: 'All active sessions for this user have been revoked.',
    },
  });
});

// ----------------------------------------------------------
// 8. GET /api/v1/admin/departments — List Departments with Member Counts
// ----------------------------------------------------------
adminRouter.get('/departments', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT d.id, d.name, d.description, COUNT(ud.user_id) as member_count
     FROM departments d
     LEFT JOIN user_departments ud ON d.id = ud.department_id
     GROUP BY d.id
     ORDER BY d.name ASC`
  ).all<{ id: string; name: string; description: string; member_count: number }>();

  const departments = result.results.map((d) => ({
    id: d.id as DepartmentId,
    name: d.name,
    description: d.description,
    memberCount: d.member_count,
  }));

  return c.json({ success: true, data: { departments } });
});

// ----------------------------------------------------------
// 9. GET /api/v1/admin/roles — List Roles with Member Counts
// ----------------------------------------------------------
adminRouter.get('/roles', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT r.id, r.name, COUNT(ur.user_id) as member_count
     FROM roles r
     LEFT JOIN user_roles ur ON r.id = ur.role_id
     GROUP BY r.id
     ORDER BY r.name ASC`
  ).all<{ id: string; name: string; member_count: number }>();

  const roles = result.results.map((r) => ({
    id: r.id as RoleId,
    name: r.name,
    memberCount: r.member_count,
  }));

  return c.json({ success: true, data: { roles } });
});

// ----------------------------------------------------------
// 10. GET /api/v1/admin/audit-logs — View Administrative Audit Logs
// ----------------------------------------------------------
adminRouter.get('/audit-logs', async (c) => {
  const url = new URL(c.req.url);
  const limitParam = parseInt(url.searchParams.get('limit') || '50', 10);
  const limit = Math.min(Math.max(limitParam, 1), 200);
  const actionFilter = url.searchParams.get('action');

  let query = `
    SELECT 
      a.id, a.timestamp, a.user_id, a.action, a.details, a.ip_address, a.user_agent,
      u.email as user_email, u.full_name as user_full_name
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
  `;

  if (actionFilter) {
    query += ` WHERE a.action = ? ORDER BY a.timestamp DESC LIMIT ?`;
    const result = await c.env.DB.prepare(query).bind(actionFilter, limit).all<{
      id: string;
      timestamp: number;
      user_id: string | null;
      action: string;
      details: string | null;
      ip_address: string | null;
      user_agent: string | null;
      user_email: string | null;
      user_full_name: string | null;
    }>();

    const logs = result.results.map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      userId: l.user_id,
      userEmail: l.user_email,
      userFullName: l.user_full_name,
      action: l.action,
      details: l.details ? JSON.parse(l.details) : null,
      ipAddress: l.ip_address,
      userAgent: l.user_agent,
    }));

    return c.json({ success: true, data: { logs, count: logs.length } });
  }

  query += ` ORDER BY a.timestamp DESC LIMIT ?`;
  const result = await c.env.DB.prepare(query).bind(limit).all<{
    id: string;
    timestamp: number;
    user_id: string | null;
    action: string;
    details: string | null;
    ip_address: string | null;
    user_agent: string | null;
    user_email: string | null;
    user_full_name: string | null;
  }>();

  const logs = result.results.map((l) => ({
    id: l.id,
    timestamp: l.timestamp,
    userId: l.user_id,
    userEmail: l.user_email,
    userFullName: l.user_full_name,
    action: l.action,
    details: l.details ? JSON.parse(l.details) : null,
    ipAddress: l.ip_address,
    userAgent: l.user_agent,
  }));

  return c.json({ success: true, data: { logs, count: logs.length } });
});

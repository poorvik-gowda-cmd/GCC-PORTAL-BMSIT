// ==========================================================
// GCC Portal — Task Routes (D1 as primary store)
// apps/api/src/routes/tasks.ts
// ==========================================================

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { AuthVariables } from '../middleware/auth';
import { requireAuth, requirePermission } from '../middleware/auth';
import { auditLog } from '../services/auditService';
import { SheetsClient, TasksAdapter } from '@gcc-portal/google-adapters';
import { canAccessDepartment, canModifyTask } from '@gcc-portal/permissions';
import {
  CreateTaskSchema, UpdateTaskSchema, AddRemarkSchema, DepartmentIdSchema,
  type Task, type TaskStatus, type TaskPriority, type DepartmentId,
} from '@gcc-portal/contracts';
import { computeIsOverdue } from '@gcc-portal/permissions';

type Variables = AuthVariables;
export const tasksRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

interface DbTask {
  task_id: string; title: string; description: string; department: string;
  assigned_to: string; assigned_to_name: string; assigned_by: string;
  deadline: string; priority: string; status: string; latest_update: string | null;
  president_remark: string | null; created_at: number; updated_at: number;
  completed_at: number | null;
}

function dbTaskToTask(row: DbTask): Task {
  const rawStatus = row.status as TaskStatus;
  const status: TaskStatus =
    computeIsOverdue(row.deadline, rawStatus) && rawStatus !== 'COMPLETED' ? 'OVERDUE' : rawStatus;
  return {
    taskId: row.task_id,
    title: row.title,
    description: row.description,
    department: row.department as DepartmentId,
    assignedTo: row.assigned_to,
    assignedToName: row.assigned_to_name,
    assignedBy: row.assigned_by,
    deadline: row.deadline,
    priority: row.priority as TaskPriority,
    status,
    latestUpdate: row.latest_update ?? null,
    presidentRemark: row.president_remark ?? null,
    createdAt: new Date(row.created_at * 1000).toISOString(),
    updatedAt: new Date(row.updated_at * 1000).toISOString(),
    completedAt: row.completed_at ? new Date(row.completed_at * 1000).toISOString() : null,
  };
}

// Background Sheets sync — never blocks the response
function syncTaskToSheets(env: Env, ctx: any, taskData: any) {
  try {
    const sheets = new SheetsClient(env.GOOGLE_SHEETS_SPREADSHEET_ID, {
      clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    });
    const adapter = new TasksAdapter(sheets);
    const promise = adapter.createTask(taskData).catch((e) =>
      console.error('[SheetsSync] Task sync failed:', e.message)
    );
    if (ctx?.waitUntil) ctx.waitUntil(promise);
  } catch {}
}

const TaskFilterSchema = z.object({
  department: DepartmentIdSchema.optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedTo: z.string().optional(),
});

// GET /api/v1/tasks — List tasks (D1)
tasksRouter.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  const filter = TaskFilterSchema.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));

  let rows: DbTask[];

  if (user.permissions.includes('TASK_VIEW_GLOBAL')) {
    const res = await c.env.DB.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all<DbTask>();
    rows = res.results;
  } else if (user.permissions.includes('TASK_VIEW_DEPARTMENT')) {
    const depts = user.departments;
    if (depts.length === 0) return c.json({ success: true, data: { tasks: [] } });
    const placeholders = depts.map(() => '?').join(',');
    const res = await c.env.DB
      .prepare(`SELECT * FROM tasks WHERE department IN (${placeholders}) ORDER BY created_at DESC`)
      .bind(...depts)
      .all<DbTask>();
    rows = res.results;
  } else {
    return c.json({ success: true, data: { tasks: [] } });
  }

  let tasks = rows.map(dbTaskToTask);

  if (filter.success && filter.data) {
    const f = filter.data;
    if (f.department) tasks = tasks.filter((t) => t.department === f.department);
    if (f.status) tasks = tasks.filter((t) => t.status === f.status);
    if (f.priority) tasks = tasks.filter((t) => t.priority === f.priority);
    if (f.assignedTo) tasks = tasks.filter((t) => t.assignedTo === f.assignedTo);
  }

  return c.json({ success: true, data: { tasks } });
});

// POST /api/v1/tasks — Create & assign a task (D1 primary, Sheets async)
tasksRouter.post(
  '/',
  requireAuth,
  zValidator('json', CreateTaskSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json') as z.infer<typeof CreateTaskSchema>;
    const ip = c.req.header('CF-Connecting-IP') ?? '';
    const ua = c.req.header('User-Agent') ?? '';

    // TASK_ASSIGN_GLOBAL (EC) OR TASK_ASSIGN_DEPARTMENT (Dept Leads)
    const canAssign =
      user.permissions.includes('TASK_ASSIGN_GLOBAL') ||
      user.permissions.includes('TASK_ASSIGN_DEPARTMENT');

    if (!canAssign) {
      await auditLog(c.env.DB, user.id, 'PERMISSION_DENIED', { permission: 'TASK_ASSIGN_DEPARTMENT', path: '/api/v1/tasks' }, ip, ua);
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to assign tasks' } }, 403);
    }

    if (!user.permissions.includes('TASK_ASSIGN_GLOBAL') && !canAccessDepartment(user, body.department)) {
      await auditLog(c.env.DB, user.id, 'PERMISSION_DENIED', { action: 'create_task', department: body.department }, ip, ua);
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot assign tasks to other departments' } }, 403);
    }

    const assigneeRow = await c.env.DB
      .prepare('SELECT full_name FROM users WHERE id = ?')
      .bind(body.assignedTo)
      .first<{ full_name: string }>();

    if (!assigneeRow) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Assigned user not found' } }, 404);
    }

    // Generate task ID via atomic D1 counter
    const year = new Date().getFullYear();
    const prefix = `TASK-${year}`;
    await c.env.DB.prepare('INSERT OR IGNORE INTO id_counters (prefix, next_seq) VALUES (?, 1)').bind(prefix).run();
    const batchRes = await c.env.DB.batch([
      c.env.DB.prepare('UPDATE id_counters SET next_seq = next_seq + 1 WHERE prefix = ?').bind(prefix),
      c.env.DB.prepare('SELECT next_seq FROM id_counters WHERE prefix = ?').bind(prefix),
    ]);
    const seq = (batchRes[1]?.results?.[0] as { next_seq: number } | undefined)?.next_seq ?? 1;
    const taskId = TasksAdapter.generateTaskId(year, seq);
    const now = Math.floor(Date.now() / 1000);

    // Write to D1 — primary store
    await c.env.DB.prepare(
      `INSERT INTO tasks (task_id, title, description, department, assigned_to, assigned_to_name,
       assigned_by, deadline, priority, status, latest_update, president_remark, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NOT_STARTED', NULL, NULL, ?, ?)`
    ).bind(
      taskId, body.title, body.description ?? '', body.department,
      body.assignedTo, assigneeRow.full_name, user.id,
      body.deadline, body.priority, now, now
    ).run();

    // Async sync to Google Sheets (non-blocking)
    const nowIso = new Date(now * 1000).toISOString();
    syncTaskToSheets(c.env, c.executionCtx, {
      taskId, title: body.title, description: body.description ?? '',
      department: body.department, assignedTo: body.assignedTo,
      assignedToName: assigneeRow.full_name, assignedBy: user.id,
      deadline: body.deadline, priority: body.priority,
      createdAt: nowIso, updatedAt: nowIso,
    });

    await auditLog(c.env.DB, user.id, 'TASK_ASSIGNED', { taskId, assignedTo: body.assignedTo, department: body.department }, ip, ua);
    return c.json({ success: true, data: { taskId } }, 201);
  }
);

// GET /api/v1/tasks/:id — Get single task (D1)
tasksRouter.get('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const taskId = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM tasks WHERE task_id = ?').bind(taskId).first<DbTask>();

  if (!row) return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, 404);

  if (!canAccessDepartment(user, row.department as DepartmentId)) {
    const ip = c.req.header('CF-Connecting-IP') ?? '';
    await auditLog(c.env.DB, user.id, 'PERMISSION_DENIED', { action: 'view_task', taskId }, ip, '');
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403);
  }

  return c.json({ success: true, data: { task: dbTaskToTask(row) } });
});

// PATCH /api/v1/tasks/:id — Update task status (D1)
tasksRouter.patch(
  '/:id',
  requireAuth,
  requirePermission('TASK_UPDATE_OWN'),
  zValidator('json', UpdateTaskSchema),
  async (c) => {
    const user = c.get('user');
    const taskId = c.req.param('id');
    const body = c.req.valid('json') as z.infer<typeof UpdateTaskSchema>;
    const ip = c.req.header('CF-Connecting-IP') ?? '';
    const ua = c.req.header('User-Agent') ?? '';

    const row = await c.env.DB.prepare('SELECT * FROM tasks WHERE task_id = ?').bind(taskId).first<DbTask>();
    if (!row) return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, 404);

    if (!canModifyTask(user, row.assigned_to, true)) {
      await auditLog(c.env.DB, user.id, 'PERMISSION_DENIED', { action: 'update_task', taskId }, ip, ua);
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'You can only update your own assigned tasks' } }, 403);
    }

    const now = Math.floor(Date.now() / 1000);
    const newStatus = body.status ?? row.status;
    const completedAt = newStatus === 'COMPLETED' ? now : (row.completed_at ?? null);

    await c.env.DB.prepare(
      `UPDATE tasks SET status = ?, latest_update = ?, updated_at = ?, completed_at = ? WHERE task_id = ?`
    ).bind(newStatus, body.latestUpdate ?? row.latest_update ?? '', now, completedAt, taskId).run();

    await auditLog(c.env.DB, user.id, 'TASK_UPDATED', { taskId, status: newStatus }, ip, ua);
    return c.json({ success: true, data: { taskId } });
  }
);

// POST /api/v1/tasks/:id/remarks — Add executive remark (D1)
tasksRouter.post(
  '/:id/remarks',
  requireAuth,
  requirePermission('TASK_REMARK'),
  zValidator('json', AddRemarkSchema),
  async (c) => {
    const user = c.get('user');
    const taskId = c.req.param('id');
    const body = c.req.valid('json') as z.infer<typeof AddRemarkSchema>;
    const ip = c.req.header('CF-Connecting-IP') ?? '';
    const ua = c.req.header('User-Agent') ?? '';

    const row = await c.env.DB.prepare('SELECT department FROM tasks WHERE task_id = ?').bind(taskId).first<{ department: string }>();
    if (!row) return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, 404);

    if (!canAccessDepartment(user, row.department as DepartmentId)) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403);
    }

    const now = Math.floor(Date.now() / 1000);
    await c.env.DB.prepare(
      `UPDATE tasks SET president_remark = ?, updated_at = ? WHERE task_id = ?`
    ).bind(body.remark, now, taskId).run();

    await auditLog(c.env.DB, user.id, 'TASK_UPDATED', { taskId, action: 'remark_added' }, ip, ua);
    return c.json({ success: true, data: { taskId } });
  }
);

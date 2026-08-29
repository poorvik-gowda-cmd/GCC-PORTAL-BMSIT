// ==========================================================
// GCC Portal — Task Routes
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
import { CreateTaskSchema, UpdateTaskSchema, AddRemarkSchema, DepartmentIdSchema, type Task } from '@gcc-portal/contracts';

type Variables = AuthVariables;

export const tasksRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

function getAdapters(env: Env) {
  const sheets = new SheetsClient(env.GOOGLE_SHEETS_SPREADSHEET_ID, {
    clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  });
  return new TasksAdapter(sheets);
}

const TaskFilterSchema = z.object({
  department: DepartmentIdSchema.optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedTo: z.string().optional(),
});

tasksRouter.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  const adapter = getAdapters(c.env);
  const filter = TaskFilterSchema.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));

  let tasks: Task[] = user.permissions.includes('TASK_VIEW_GLOBAL')
    ? await adapter.getAllTasks()
    : user.permissions.includes('TASK_VIEW_DEPARTMENT')
    ? await Promise.all(user.departments.map((d) => adapter.getTasksByDepartment(d))).then((r) =>
        r.flat()
      )
    : [];

  if (filter.success && filter.data) {
    const f = filter.data;
    if (f.department) tasks = tasks.filter((t: Task) => t.department === f.department);
    if (f.status) tasks = tasks.filter((t: Task) => t.status === f.status);
    if (f.priority) tasks = tasks.filter((t: Task) => t.priority === f.priority);
    if (f.assignedTo) tasks = tasks.filter((t: Task) => t.assignedTo === f.assignedTo);
  }

  return c.json({ success: true, data: { tasks } });
});

tasksRouter.post(
  '/',
  requireAuth,
  requirePermission('TASK_ASSIGN_DEPARTMENT'),
  zValidator('json', CreateTaskSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json') as z.infer<typeof CreateTaskSchema>;
    const ip = c.req.header('CF-Connecting-IP') ?? '';
    const ua = c.req.header('User-Agent') ?? '';

    if (
      !user.permissions.includes('TASK_ASSIGN_GLOBAL') &&
      !canAccessDepartment(user, body.department)
    ) {
      await auditLog(c.env.DB, user.id, 'PERMISSION_DENIED', { action: 'create_task', department: body.department }, ip, ua);
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot assign tasks to other departments' } }, 403);
    }

    const year = new Date().getFullYear();
    const prefix = `TASK-${year}`;

    // Atomic increment of sequence
    await c.env.DB.prepare('INSERT OR IGNORE INTO id_counters (prefix, next_seq) VALUES (?, 1)').bind(prefix).run();
    const batchRes = await c.env.DB.batch([
      c.env.DB.prepare('UPDATE id_counters SET next_seq = next_seq + 1 WHERE prefix = ?').bind(prefix),
      c.env.DB.prepare('SELECT next_seq FROM id_counters WHERE prefix = ?').bind(prefix),
    ]);

    const selectResult = batchRes[1]?.results?.[0] as { next_seq: number } | undefined;
    const seq = selectResult?.next_seq ?? 1;
    const taskId = TasksAdapter.generateTaskId(year, seq);

    const assigneeRow = await c.env.DB
      .prepare('SELECT full_name FROM users WHERE id = ?')
      .bind(body.assignedTo)
      .first<{ full_name: string }>();

    if (!assigneeRow) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Assigned user not found' } }, 404);
    }

    const adapter = getAdapters(c.env);
    await adapter.createTask({
      taskId,
      title: body.title,
      description: body.description,
      department: body.department,
      assignedTo: body.assignedTo,
      assignedToName: assigneeRow.full_name,
      assignedBy: user.id,
      deadline: body.deadline,
      priority: body.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await auditLog(c.env.DB, user.id, 'TASK_ASSIGNED', { taskId, assignedTo: body.assignedTo, department: body.department }, ip, ua);

    return c.json({ success: true, data: { taskId } }, 201);
  }
);

tasksRouter.get('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const taskId = c.req.param('id');
  const adapter = getAdapters(c.env);
  const task = await adapter.getTaskById(taskId);

  if (!task) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, 404);
  }

  if (!canAccessDepartment(user, task.department)) {
    const ip = c.req.header('CF-Connecting-IP') ?? '';
    await auditLog(c.env.DB, user.id, 'PERMISSION_DENIED', { action: 'view_task', taskId }, ip, '');
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403);
  }

  return c.json({ success: true, data: { task } });
});

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
    const adapter = getAdapters(c.env);

    const task = await adapter.getTaskById(taskId);
    if (!task) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, 404);
    }

    if (!canModifyTask(user, task.assignedTo, true)) {
      await auditLog(c.env.DB, user.id, 'PERMISSION_DENIED', { action: 'update_task', taskId }, ip, ua);
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'You can only update your own assigned tasks' } }, 403);
    }

    await adapter.updateTaskStatus(taskId, body.status ?? task.status, body.latestUpdate ?? '');
    await auditLog(c.env.DB, user.id, 'TASK_UPDATED', { taskId, status: body.status }, ip, ua);

    return c.json({ success: true, data: { taskId } });
  }
);

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
    const adapter = getAdapters(c.env);

    const task = await adapter.getTaskById(taskId);
    if (!task) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, 404);
    }

    if (!canAccessDepartment(user, task.department)) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403);
    }

    await adapter.addPresidentRemark(taskId, body.remark);
    await auditLog(c.env.DB, user.id, 'TASK_UPDATED', { taskId, action: 'remark_added' }, ip, ua);

    return c.json({ success: true, data: { taskId } });
  }
);
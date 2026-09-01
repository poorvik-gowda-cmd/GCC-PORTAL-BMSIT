// ==========================================================
// GCC Portal — Collaborations Router (D1)
// apps/api/src/routes/collaborations.ts
// ==========================================================

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { AuthVariables } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { auditLog } from '../services/auditService';

type Variables = AuthVariables;
export const collaborationsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

const CreateCollaborationSchema = z.object({
  title: z.string().min(2),
  institution: z.string().min(2),
  description: z.string().min(5),
  mouFileUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['ACTIVE', 'UPCOMING', 'IN_REVIEW']).default('ACTIVE'),
});

// GET /api/v1/collaborations — List all active MoUs & collaborations (Public)
collaborationsRouter.get('/', async (c) => {
  const res = await c.env.DB.prepare(
    'SELECT * FROM collaborations ORDER BY created_at DESC'
  ).all();
  return c.json({ success: true, data: { collaborations: res.results } });
});

// POST /api/v1/collaborations — Create/Publish MoU (EC, SuperAdmin, Research)
collaborationsRouter.post(
  '/',
  requireAuth,
  zValidator('json', CreateCollaborationSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');

    const canPublish =
      user.roles.includes('SYSTEM_SUPER_ADMIN') ||
      user.roles.includes('EXECUTIVE_COUNCIL') ||
      user.departments.includes('RESEARCH_PUBLICATION');

    if (!canPublish) {
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only Executive Council, Super Admin, or Research Team can publish MoUs' } },
        403
      );
    }

    const id = `MOU-${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(
      `INSERT INTO collaborations (id, title, institution, description, mou_file_url, image_url, status, published_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.title, body.institution, body.description,
      body.mouFileUrl ?? null, body.imageUrl ?? null, body.status,
      user.id, now, now
    ).run();

    const ip = c.req.header('CF-Connecting-IP') ?? '';
    const ua = c.req.header('User-Agent') ?? '';
    await auditLog(c.env.DB, user.id, 'DOCUMENT_ACCESS', { action: 'publish_mou', id }, ip, ua);

    return c.json({ success: true, data: { id } }, 201);
  }
);

// DELETE /api/v1/collaborations/:id (EC, SuperAdmin, Research)
collaborationsRouter.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const canDelete =
    user.roles.includes('SYSTEM_SUPER_ADMIN') ||
    user.roles.includes('EXECUTIVE_COUNCIL') ||
    user.departments.includes('RESEARCH_PUBLICATION');

  if (!canDelete) {
    return c.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } },
      403
    );
  }

  await c.env.DB.prepare('DELETE FROM collaborations WHERE id = ?').bind(id).run();
  return c.json({ success: true, data: { deleted: true } });
});

// ==========================================================
// GCC Portal — Opportunities Router (D1)
// apps/api/src/routes/opportunities.ts
// ==========================================================

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../types/env';
import type { AuthVariables } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';
import { auditLog } from '../services/auditService';

type Variables = AuthVariables;
export const opportunitiesRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

const CreateOpportunitySchema = z.object({
  title: z.string().min(2),
  category: z.enum(['FELLOWSHIP', 'RESEARCH_GRANT', 'EXCHANGE_PROGRAM', 'INTERNSHIP', 'OTHER']).default('FELLOWSHIP'),
  description: z.string().min(5),
  deadline: z.string().optional(),
  applyUrl: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

// GET /api/v1/opportunities — List all opportunity announcements (Public)
opportunitiesRouter.get('/', async (c) => {
  const res = await c.env.DB.prepare(
    'SELECT * FROM opportunities ORDER BY created_at DESC'
  ).all();
  return c.json({ success: true, data: { opportunities: res.results } });
});

// POST /api/v1/opportunities — Publish Opportunity Announcement (EC, SuperAdmin, Research)
opportunitiesRouter.post(
  '/',
  requireAuth,
  zValidator('json', CreateOpportunitySchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');

    const canPublish =
      user.roles.includes('SYSTEM_SUPER_ADMIN') ||
      user.roles.includes('EXECUTIVE_COUNCIL') ||
      user.departments.includes('RESEARCH_PUBLICATION');

    if (!canPublish) {
      return c.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only Executive Council, Super Admin, or Research Team can publish opportunities' } },
        403
      );
    }

    const id = `OPP-${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(
      `INSERT INTO opportunities (id, title, category, description, deadline, apply_url, attachment_url, published_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.title, body.category, body.description,
      body.deadline ?? null, body.applyUrl ?? null, body.attachmentUrl ?? null,
      user.id, now, now
    ).run();

    const ip = c.req.header('CF-Connecting-IP') ?? '';
    const ua = c.req.header('User-Agent') ?? '';
    await auditLog(c.env.DB, user.id, 'DOCUMENT_ACCESS', { action: 'publish_opportunity', id }, ip, ua);

    return c.json({ success: true, data: { id } }, 201);
  }
);

// DELETE /api/v1/opportunities/:id (EC, SuperAdmin, Research)
opportunitiesRouter.delete('/:id', requireAuth, async (c) => {
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

  await c.env.DB.prepare('DELETE FROM opportunities WHERE id = ?').bind(id).run();
  return c.json({ success: true, data: { deleted: true } });
});

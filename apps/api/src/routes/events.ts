// ==========================================================
// GCC Portal — Events Routes (D1 Database Source of Truth)
// apps/api/src/routes/events.ts
// ==========================================================

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { z } from 'zod';
import type { Env } from '../types/env';
import type { AuthVariables } from '../middleware/auth';
import { requireAuth, requirePermission, requireAnyPermission } from '../middleware/auth';
import { validateSession } from '../services/authService';
import { auditLog } from '../services/auditService';
import { verifyTurnstileToken } from '../security/turnstile';
import { rateLimiter } from '../middleware/rateLimitMiddleware';
import { SheetsClient, EventsAdapter } from '@gcc-portal/google-adapters';
import { CreateEventSchema, EventRegistrationSchema } from '@gcc-portal/contracts';
import type { GccEvent, EventStatus, RegistrationStatus } from '@gcc-portal/contracts';
import type { DbEvent, DbEventRegistration } from '@gcc-portal/database';

type Variables = AuthVariables;
export const eventsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

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

function getAdapter(env: Env) {
  const sheets = new SheetsClient(env.GOOGLE_SHEETS_SPREADSHEET_ID, {
    clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  });
  return new EventsAdapter(sheets);
}

function dbEventToGccEvent(row: DbEvent): GccEvent {
  return {
    eventId: row.event_id,
    title: row.title,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    category: row.category,
    venue: row.venue,
    startDate: row.start_date,
    endDate: row.end_date,
    registrationStatus: row.registration_status as RegistrationStatus,
    eventStatus: row.event_status as EventStatus,
    capacity: row.capacity,
    registeredCount: row.registered_count ?? 0,
    bannerImageRef: row.banner_image_ref,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at * 1000).toISOString(),
    updatedAt: new Date(row.updated_at * 1000).toISOString(),
  };
}

const runBackground = (c: any, promise: Promise<any>) => {
  if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
    c.executionCtx.waitUntil(promise);
  } else {
    promise.catch((err) => console.error('[Background] Error:', err));
  }
};

// GET /api/v1/events — Public listing of published events
eventsRouter.get('/', async (c) => {
  const result = await c.env.DB
    .prepare('SELECT * FROM events WHERE event_status = "PUBLISHED" ORDER BY start_date ASC')
    .all<DbEvent>();
  const events = result.results.map(dbEventToGccEvent);
  return c.json({ success: true, data: { events } });
});

// GET /api/v1/events/all — Management listing of all events
eventsRouter.get('/all', requireAuth, requireAnyPermission('EVENT_EDIT', 'EVENT_CREATE', 'REGISTRATION_VIEW', 'QR_GENERATE'), async (c) => {
  const result = await c.env.DB
    .prepare('SELECT * FROM events ORDER BY created_at DESC')
    .all<DbEvent>();
  const events = result.results.map(dbEventToGccEvent);
  return c.json({ success: true, data: { events } });
});

// GET /api/v1/events/:id — Get details of a single event (public if published)
eventsRouter.get('/:id', async (c) => {
  const eventId = c.req.param('id');
  const event = await c.env.DB
    .prepare('SELECT * FROM events WHERE event_id = ?')
    .bind(eventId)
    .first<DbEvent>();

  if (!event) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } }, 404);
  }

  if (event.event_status !== 'PUBLISHED') {
    const token = getSessionToken(c.req.raw);
    if (!token) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } }, 404);
    }
    const user = await validateSession(c.env.DB, token);
    if (!user || !user.permissions.includes('EVENT_EDIT')) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } }, 404);
    }
  }

  return c.json({ success: true, data: { event: dbEventToGccEvent(event) } });
});

// POST /api/v1/events — Create a new event
eventsRouter.post(
  '/',
  requireAuth,
  requirePermission('EVENT_CREATE'),
  zValidator('json', CreateEventSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json') as z.infer<typeof CreateEventSchema>;
    const ip = c.req.header('CF-Connecting-IP') ?? '';
    const ua = c.req.header('User-Agent') ?? '';
    const year = new Date().getFullYear();
    const prefix = `EVENT-${year}`;

    // Atomic increment of sequence
    await c.env.DB.prepare('INSERT OR IGNORE INTO id_counters (prefix, next_seq) VALUES (?, 1)').bind(prefix).run();
    const batchRes = await c.env.DB.batch([
      c.env.DB.prepare('UPDATE id_counters SET next_seq = next_seq + 1 WHERE prefix = ?').bind(prefix),
      c.env.DB.prepare('SELECT next_seq FROM id_counters WHERE prefix = ?').bind(prefix),
    ]);

    const selectResult = batchRes[1]?.results?.[0] as { next_seq: number } | undefined;
    const seq = selectResult?.next_seq ?? 1;
    const eventId = `EVENT-${year}-${String(seq).padStart(3, '0')}`;
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB
      .prepare(
        `INSERT INTO events (
          event_id, title, short_description, full_description, category,
          venue, start_date, end_date, registration_status, event_status,
          capacity, registered_count, banner_image_ref, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`
      )
      .bind(
        eventId,
        body.title,
        body.shortDescription,
        body.fullDescription,
        body.category,
        body.venue,
        body.startDate,
        body.endDate,
        'CLOSED',
        'DRAFT',
        body.capacity ?? null,
        body.bannerImageRef ?? null,
        user.id,
        now,
        now
      )
      .run();

    // Async sync to Sheets
    const adapter = getAdapter(c.env);
    runBackground(c, adapter.createEvent({
      eventId,
      title: body.title,
      shortDescription: body.shortDescription,
      fullDescription: body.fullDescription,
      category: body.category,
      venue: body.venue,
      startDate: body.startDate,
      endDate: body.endDate,
      registrationStatus: 'CLOSED',
      eventStatus: 'DRAFT',
      capacity: body.capacity ?? null,
      bannerImageRef: body.bannerImageRef ?? null,
      createdBy: user.id,
      createdAt: new Date(now * 1000).toISOString(),
      updatedAt: new Date(now * 1000).toISOString(),
    }).catch((err) => console.error(`[SheetsSync] Event create sync failed: ${err.message}`)));

    await auditLog(c.env.DB, user.id, 'EVENT_CREATED', { eventId, title: body.title }, ip, ua);
    return c.json({ success: true, data: { eventId } }, 201);
  }
);

// POST /api/v1/events/:id/publish — Publish/Draft event
eventsRouter.post('/:id/publish', requireAuth, requirePermission('EVENT_PUBLISH'), async (c) => {
  const user = c.get('user');
  const eventId = c.req.param('id');
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';
  const now = Math.floor(Date.now() / 1000);

  const body = await c.req.json<{ publish: boolean }>();
  const status = body.publish ? 'PUBLISHED' : 'DRAFT';

  const result = await c.env.DB
    .prepare('UPDATE events SET event_status = ?, updated_at = ? WHERE event_id = ?')
    .bind(status, now, eventId)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } }, 404);
  }

  // Async sync to Sheets
  const adapter = getAdapter(c.env);
  runBackground(c, adapter.publishEvent(eventId, status).catch((err) =>
    console.error(`[SheetsSync] Event publish sync failed: ${err.message}`)
  ));

  await auditLog(c.env.DB, user.id, 'EVENT_PUBLISHED', { eventId, status }, ip, ua);
  return c.json({ success: true, data: { eventId, status } });
});

// POST /api/v1/events/:id/registration-status — Toggle registration open/closed
eventsRouter.post('/:id/registration-status', requireAuth, requireAnyPermission('EVENT_EDIT', 'EVENT_CREATE', 'EVENT_PUBLISH'), async (c) => {
  const user = c.get('user');
  const eventId = c.req.param('id');
  const ip = c.req.header('CF-Connecting-IP') ?? '';
  const ua = c.req.header('User-Agent') ?? '';
  const now = Math.floor(Date.now() / 1000);

  const body = await c.req.json<{ status: 'OPEN' | 'CLOSED' }>();
  if (!body.status || !['OPEN', 'CLOSED'].includes(body.status)) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid registration status. Must be OPEN or CLOSED.' } }, 400);
  }

  const result = await c.env.DB
    .prepare('UPDATE events SET registration_status = ?, updated_at = ? WHERE event_id = ?')
    .bind(body.status, now, eventId)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } }, 404);
  }

  // Async sync to Sheets
  const adapter = getAdapter(c.env);
  runBackground(c, adapter.setRegistrationStatus(eventId, body.status as RegistrationStatus).catch((err) =>
    console.error(`[SheetsSync] Event reg status sync failed: ${err.message}`)
  ));

  await auditLog(c.env.DB, user.id, 'ADMIN_ACTION', { action: 'EVENT_REGISTRATION_STATUS_CHANGED', eventId, status: body.status }, ip, ua);
  return c.json({ success: true, data: { eventId, registrationStatus: body.status } });
});

// POST /api/v1/events/:id/register — Public registration (atomic)
eventsRouter.post(
  '/:id/register',
  rateLimiter('register', 10, 300), // Max 10 registrations per 5 min per IP
  zValidator('json', EventRegistrationSchema, (result, c) => {
    if (!result.success) {
      const issue = result.error.issues[0];
      const message = issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid registration submission';
      return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message } }, 400);
    }
  }),
  async (c) => {
    const eventId = c.req.param('id');
    const body = c.req.valid('json') as z.infer<typeof EventRegistrationSchema>;
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';

    // 1. Verify Turnstile Token (with passthrough fallback)
    const turnstileToken = body.turnstileToken || 'PASSTHROUGH_TOKEN';
    const turnstileResult = await verifyTurnstileToken(c.env.TURNSTILE_SECRET_KEY, turnstileToken, ip);
    if (!turnstileResult.success) {
      return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Bot verification failed' } }, 400);
    }

    // 2. Pre-flight check event
    const event = await c.env.DB
      .prepare('SELECT event_status, registration_status, capacity, registered_count FROM events WHERE event_id = ?')
      .bind(eventId)
      .first<{ event_status: string; registration_status: string; capacity: number | null; registered_count: number }>();

    if (!event || event.event_status !== 'PUBLISHED') {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found or unavailable' } }, 404);
    }

    if (event.registration_status !== 'OPEN') {
      return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Registration is closed for this event' } }, 400);
    }

    if (event.capacity !== null && event.registered_count >= event.capacity) {
      return c.json({ success: false, error: { code: 'FULL', message: 'Event has reached maximum capacity' } }, 400);
    }

    // 3. Atomically generate sequence for registration ID
    const year = new Date().getFullYear();
    const prefix = `REG-${year}`;
    await c.env.DB.prepare('INSERT OR IGNORE INTO id_counters (prefix, next_seq) VALUES (?, 1)').bind(prefix).run();
    
    const batchCounter = await c.env.DB.batch([
      c.env.DB.prepare('UPDATE id_counters SET next_seq = next_seq + 1 WHERE prefix = ?').bind(prefix),
      c.env.DB.prepare('SELECT next_seq FROM id_counters WHERE prefix = ?').bind(prefix),
    ]);

    const selectCounterResult = batchCounter[1]?.results?.[0] as { next_seq: number } | undefined;
    const regSeq = selectCounterResult?.next_seq ?? 1;

    const eventSeq = parseInt(eventId.split('-')[2] ?? '1', 10);
    const registrationId = EventsAdapter.generateRegistrationId(year, eventSeq, regSeq);
    const now = Math.floor(Date.now() / 1000);

    // 4. Atomic transaction batch for registration and counter update
    try {
      await c.env.DB.batch([
        // Insert registration (UNIQUE constraint guards against duplicate email)
        c.env.DB.prepare(
          `INSERT INTO event_registrations (
            registration_id, event_id, full_name, email, phone,
            college_name, usn, department, custom_fields, registered_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          registrationId,
          eventId,
          body.fullName,
          body.email.toLowerCase().trim(),
          body.phone,
          body.collegeName ?? null,
          body.usn ?? null,
          body.department ?? null,
          body.customFields ? JSON.stringify(body.customFields) : null,
          now
        ),
        // Increment registered_count (CHECK constraint guards against capacity overflow)
        c.env.DB.prepare(
          `UPDATE events
           SET registered_count = registered_count + 1,
               registration_status = CASE
                 WHEN capacity IS NOT NULL AND registered_count + 1 >= capacity THEN 'FULL'
                 ELSE registration_status
               END
           WHERE event_id = ?`
        ).bind(eventId),
      ]);
    } catch (err: any) {
      if (err.message?.includes('UNIQUE constraint failed')) {
        return c.json({ success: false, error: { code: 'DUPLICATE', message: 'You have already registered for this event' } }, 409);
      }
      if (err.message?.includes('CHECK constraint failed')) {
        return c.json({ success: false, error: { code: 'FULL', message: 'Event capacity reached' } }, 400);
      }
      throw err;
    }

    // 5. Async sync to Google Sheets
    const adapter = getAdapter(c.env);
    runBackground(c, (async () => {
      await adapter.addRegistration({
        registrationId,
        eventId,
        fullName: body.fullName,
        email: body.email.toLowerCase().trim(),
        phone: body.phone,
        collegeName: body.collegeName,
        usn: body.usn,
        department: body.department,
        customFields: body.customFields,
      });

      // If event became full, update sheets event registration status as well
      const updatedEvent = await c.env.DB
        .prepare('SELECT registration_status FROM events WHERE event_id = ?')
        .bind(eventId)
        .first<{ registration_status: string }>();

      if (updatedEvent?.registration_status === 'FULL') {
        await adapter.setRegistrationStatus(eventId, 'FULL');
      }
    })().catch((err) => console.error(`[SheetsSync] Registration sync failed: ${err.message}`)));

    return c.json({ success: true, data: { registrationId, message: 'Registration successful!' } }, 201);
  }
);

// GET /api/v1/events/:id/registrations — Management listing
eventsRouter.get(
  '/:id/registrations',
  requireAuth,
  requirePermission('REGISTRATION_VIEW'),
  async (c) => {
    const eventId = c.req.param('id');
    const result = await c.env.DB
      .prepare('SELECT * FROM event_registrations WHERE event_id = ? ORDER BY registered_at DESC')
      .bind(eventId)
      .all<DbEventRegistration>();

    const registrations = result.results.map((r) => ({
      registrationId: r.registration_id,
      eventId: r.event_id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      collegeName: r.college_name,
      usn: r.usn,
      department: r.department,
      customFields: r.custom_fields ? JSON.parse(r.custom_fields) : null,
      registeredAt: new Date(r.registered_at * 1000).toISOString(),
    }));

    return c.json({ success: true, data: { registrations, count: registrations.length } });
  }
);
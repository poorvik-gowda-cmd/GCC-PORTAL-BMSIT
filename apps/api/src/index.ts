// ==========================================================
// GCC Portal — Cloudflare Worker Entry Point (Hono)
// apps/api/src/index.ts
// ==========================================================

import { Hono } from 'hono';
import type { Env } from './types/env';
import { loggerMiddleware } from './middleware/logger';
import { corsAndHeaders } from './middleware/cors';
import { csrfMiddleware } from './middleware/csrf';
import { authRouter } from './routes/auth';
import { tasksRouter } from './routes/tasks';
import { eventsRouter } from './routes/events';
import { adminRouter } from './routes/admin';
import { membersRouter } from './routes/members';
import { mousRouter } from './routes/mous';
import { filesRouter } from './routes/files';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', loggerMiddleware());
app.use('*', corsAndHeaders);
app.use('*', csrfMiddleware);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'gcc-portal-api', version: '1.0.0' }));

// API v1 routes
app.route('/api/v1/auth', authRouter);
app.route('/api/v1/tasks', tasksRouter);
app.route('/api/v1/events', eventsRouter);
app.route('/api/v1/admin', adminRouter);
app.route('/api/v1/members', membersRouter);
app.route('/api/v1/mous', mousRouter);
app.route('/api/v1/files', filesRouter);

// 404 handler
app.notFound((c) =>
  c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404)
);

// Error handler — never expose stack traces to clients
app.onError((err, c) => {
  console.error('[Worker Error]', err.message);
  return c.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    500
  );
});

export default app;

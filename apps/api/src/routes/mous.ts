// ==========================================================
// GCC Portal — Public MOUs Route
// apps/api/src/routes/mous.ts
// ==========================================================

import { Hono } from 'hono';
import type { Env } from '../types/env';
import { SheetsClient, MouAdapter } from '@gcc-portal/google-adapters';
import type { MouRecord } from '@gcc-portal/contracts';

export const mousRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/mous — Public listing of approved MOUs
mousRouter.get('/', async (c) => {
  try {
    if (c.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && c.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY && c.env.GOOGLE_SHEETS_SPREADSHEET_ID && !c.env.GOOGLE_SHEETS_SPREADSHEET_ID.startsWith('REPLACE_WITH_')) {
      const sheets = new SheetsClient(c.env.GOOGLE_SHEETS_SPREADSHEET_ID, {
        clientEmail: c.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKey: c.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      });
      const adapter = new MouAdapter(sheets);
      const mous = await adapter.getApprovedMous();
      return c.json({ success: true, data: { mous } });
    }
  } catch (err: any) {
    console.error('[MOU Route] Failed to fetch from sheets adapter:', err.message);
  }

  // Fallback to empty list (real data only, never mock data)
  return c.json({ success: true, data: { mous: [] as MouRecord[] } });
});

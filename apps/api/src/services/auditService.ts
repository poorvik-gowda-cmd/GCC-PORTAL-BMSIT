// ==========================================================
// GCC Portal — Audit Logger Service
// apps/api/src/services/auditService.ts
// ==========================================================

import type { D1Database } from '@gcc-portal/database';
import type { AuditAction } from '@gcc-portal/contracts';

export async function auditLog(
  db: D1Database,
  userId: string | null,
  action: AuditAction,
  details: Record<string, unknown>,
  ip?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO audit_logs (id, timestamp, user_id, action, details, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        crypto.randomUUID(),
        Math.floor(Date.now() / 1000),
        userId,
        action,
        JSON.stringify(details),
        ip ?? null,
        userAgent ?? null
      )
      .run();
  } catch {
    console.error('[AuditLog] Failed to write audit log for action:', action);
  }
}
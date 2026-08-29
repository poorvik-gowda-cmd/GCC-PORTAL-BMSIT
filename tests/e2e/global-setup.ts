/**
 * Playwright Global Setup — runs BEFORE the API server and any tests.
 * Seeds all required test data via wrangler CLI (DB is unlocked here).
 */

import { execSync } from "child_process";

const H = "pbkdf2:310000:a166c096fcfdec217dbc09ba3df74d1e01e4ade8e2ba85a1d9af8f06ce1af8de:d7f7540b987e735c745026bc091e4e95b87e68d0f93558367d8df5bb396188f1";

function sql(stmt: string) {
  // Collapse whitespace so the command stays on one line
  const flat = stmt.replace(/\s+/g, " ").trim();
  execSync(`npx wrangler d1 execute DB --local --command="${flat}"`, {
    cwd: "apps/api",
    stdio: "pipe",
  });
}

export default async function globalSetup() {
  // ── Users ───────────────────────────────────────────────────────────────
  sql(`INSERT INTO users (id,email,password_hash,full_name,account_status,created_at,updated_at) VALUES ('TEST-MEMBER-01','member@bmsit.in','${H}','Test Member','ACTIVE',0,0) ON CONFLICT(email) DO UPDATE SET password_hash='${H}',account_status='ACTIVE'`);
  sql(`INSERT INTO users (id,email,password_hash,full_name,account_status,created_at,updated_at) VALUES ('TEST-SUSPENDED-01','suspended@bmsit.in','${H}','Test Suspended','SUSPENDED',0,0) ON CONFLICT(email) DO UPDATE SET password_hash='${H}',account_status='SUSPENDED'`);
  sql(`INSERT INTO users (id,email,password_hash,full_name,account_status,created_at,updated_at) VALUES ('TEST-REVOKED-01','revoked@bmsit.in','${H}','Test Revoked','REVOKED',0,0) ON CONFLICT(email) DO UPDATE SET password_hash='${H}',account_status='REVOKED'`);
  sql(`INSERT INTO users (id,email,password_hash,full_name,account_status,created_at,updated_at) VALUES ('USER-SUPERADMIN-01','superadmin@bmsit.in','${H}','Super Administrator','ACTIVE',0,0) ON CONFLICT(email) DO UPDATE SET password_hash='${H}',account_status='ACTIVE'`);
  sql(`INSERT OR IGNORE INTO user_roles (user_id,role_id) VALUES ('USER-SUPERADMIN-01','SYSTEM_SUPER_ADMIN')`);
  sql(`INSERT INTO users (id,email,password_hash,full_name,account_status,created_at,updated_at) VALUES ('USER-NORMAL-01','normaluser@bmsit.in','${H}','Normal Member','ACTIVE',0,0) ON CONFLICT(email) DO UPDATE SET password_hash='${H}',account_status='ACTIVE'`);
  sql(`INSERT OR IGNORE INTO user_roles (user_id,role_id) VALUES ('USER-NORMAL-01','DEPARTMENT_MEMBER')`);
  sql(`INSERT OR IGNORE INTO user_departments (user_id,department_id) VALUES ('USER-NORMAL-01','MARKETING')`);

  // ── Published event for public page test ────────────────────────────────
  sql(`INSERT INTO events (event_id,title,short_description,full_description,category,venue,start_date,end_date,registration_status,event_status,capacity,registered_count,created_by,created_at,updated_at) VALUES ('EVENT-2026-001','GCC Global Opportunities Summit 2026','Flagship summit','Full description','TECH','BMSIT Auditorium','2026-09-15T09:00:00Z','2026-09-15T17:00:00Z','OPEN','PUBLISHED',500,0,'SYSTEM',0,0) ON CONFLICT(event_id) DO UPDATE SET event_status='PUBLISHED',registration_status='OPEN'`);

  // ── Concurrency test events (clear stale registrations first) ───────────
  try { sql(`DELETE FROM event_registrations WHERE event_id IN ('EVENT-CAPACITY-001','EVENT-DUP-001')`); } catch { /* ignore */ }
  sql(`INSERT INTO events (event_id,title,short_description,full_description,category,venue,start_date,end_date,registration_status,event_status,capacity,registered_count,created_by,created_at,updated_at) VALUES ('EVENT-CAPACITY-001','Concurrency Event','Short','Full','TECH','Main','2026-09-01T10:00:00Z','2026-09-01T12:00:00Z','OPEN','PUBLISHED',1,0,'SYSTEM',0,0) ON CONFLICT(event_id) DO UPDATE SET capacity=1,registered_count=0,registration_status='OPEN'`);
  sql(`INSERT INTO events (event_id,title,short_description,full_description,category,venue,start_date,end_date,registration_status,event_status,capacity,registered_count,created_by,created_at,updated_at) VALUES ('EVENT-DUP-001','Duplicate Event','Short','Full','TECH','Main','2026-09-01T10:00:00Z','2026-09-01T12:00:00Z','OPEN','PUBLISHED',10,0,'SYSTEM',0,0) ON CONFLICT(event_id) DO UPDATE SET capacity=10,registered_count=0,registration_status='OPEN'`);

  // ── Clear any leftover rate-limit state from previous runs ──────────────
  try { sql(`DELETE FROM rate_limits`); } catch { /* table may not exist */ }

  console.log("[global-setup] Test database seeded successfully.");
}

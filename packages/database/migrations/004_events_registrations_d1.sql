-- ==========================================================
-- GCC Portal - D1 Database Schema
-- Migration 004: Events, Registrations, ID Counters, CSRF, Rate Limits
-- ==========================================================
-- D1 is now the authoritative source of truth for events and registrations.
-- Google Sheets receives a sync copy for operational/human-editable workflows.
-- ==========================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------
-- Concurrency-safe ID counters
-- NEVER use count()+1 for IDs. Use this table with atomic UPDATE.
-- Usage:
--   UPDATE id_counters SET next_seq = next_seq + 1 WHERE prefix = 'EVENT-2026'
--   SELECT next_seq FROM id_counters WHERE prefix = 'EVENT-2026'
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS id_counters (
  prefix   TEXT    NOT NULL,
  next_seq INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (prefix)
);

-- Seed initial counter prefixes for current year
INSERT OR IGNORE INTO id_counters (prefix, next_seq) VALUES
  ('EVENT-2026',   1),
  ('TASK-2026',    1),
  ('REG-2026',     1);

-- ----------------------------------------------------------
-- Events (D1 source of truth)
-- Google Sheets receives a sync copy after successful D1 commit.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  event_id              TEXT    NOT NULL PRIMARY KEY,
  title                 TEXT    NOT NULL,
  short_description     TEXT    NOT NULL,
  full_description      TEXT    NOT NULL,
  category              TEXT    NOT NULL,
  venue                 TEXT    NOT NULL,
  start_date            TEXT    NOT NULL,
  end_date              TEXT    NOT NULL,
  registration_status   TEXT    NOT NULL DEFAULT 'CLOSED'
                        CHECK(registration_status IN ('OPEN','CLOSED','FULL')),
  event_status          TEXT    NOT NULL DEFAULT 'DRAFT'
                        CHECK(event_status IN ('DRAFT','PUBLISHED','CANCELLED','COMPLETED')),
  capacity              INTEGER,
  registered_count      INTEGER NOT NULL DEFAULT 0
                        CHECK(registered_count >= 0 AND (capacity IS NULL OR registered_count <= capacity)),
  banner_image_ref      TEXT,
  created_by            TEXT    NOT NULL REFERENCES users(id),
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);

-- ----------------------------------------------------------
-- Event Registrations (D1 source of truth)
-- UNIQUE(event_id, email) is the database-level duplicate guard.
-- Two simultaneous requests cannot both succeed for the same email+event.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_registrations (
  registration_id TEXT    NOT NULL PRIMARY KEY,
  event_id        TEXT    NOT NULL REFERENCES events(event_id),
  full_name       TEXT    NOT NULL,
  email           TEXT    NOT NULL,
  phone           TEXT    NOT NULL,
  college_name    TEXT,
  usn             TEXT,
  department      TEXT,
  custom_fields   TEXT,           -- JSON string
  registered_at   INTEGER NOT NULL,
  UNIQUE(event_id, email)         -- Prevents duplicate registrations atomically
);

-- ----------------------------------------------------------
-- CSRF Tokens (double-submit pattern)
-- Issued on GET /api/v1/auth/csrf-token (requires valid session).
-- Validated on all state-changing authenticated requests.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS csrf_tokens (
  token_hash  TEXT    NOT NULL PRIMARY KEY,  -- SHA-256 of the actual token
  session_id  TEXT    NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL               -- 1 hour TTL
);

-- ----------------------------------------------------------
-- Rate Limit Entries (D1-backed sliding window per IP+endpoint)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_limit_entries (
  key          TEXT    NOT NULL,  -- e.g. "login:192.168.1.1" or "register:10.0.0.1"
  window_start INTEGER NOT NULL,  -- Unix timestamp of window start
  count        INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_status          ON events(event_status);
CREATE INDEX IF NOT EXISTS idx_events_reg_status      ON events(registration_status);
CREATE INDEX IF NOT EXISTS idx_events_created_by      ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_regs_event_id          ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_regs_email             ON event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_regs_registered_at     ON event_registrations(registered_at);
CREATE INDEX IF NOT EXISTS idx_csrf_session           ON csrf_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_csrf_expires           ON csrf_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_key         ON rate_limit_entries(key, window_start);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_type ON security_events(ip_address, event_type);

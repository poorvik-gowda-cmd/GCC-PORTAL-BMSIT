-- ==========================================================
-- GCC Portal - D1 Database Schema
-- Migration 001: Initial Schema
-- ==========================================================
-- Run: wrangler d1 execute gcc-portal-db --file=this_file.sql
-- All queries use parameterized statements in application code.
-- ==========================================================



-- ----------------------------------------------------------
-- Departments (static reference data)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT
);

-- ----------------------------------------------------------
-- Roles (static reference data)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- ----------------------------------------------------------
-- Permissions (static reference data)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
  id          TEXT PRIMARY KEY,
  description TEXT
);

-- ----------------------------------------------------------
-- Users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                      TEXT    PRIMARY KEY,
  email                   TEXT    NOT NULL UNIQUE,
  full_name               TEXT    NOT NULL,
  password_hash           TEXT    NOT NULL,
  account_status          TEXT    NOT NULL DEFAULT 'PENDING_PASSWORD_SETUP'
                          CHECK(account_status IN ('ACTIVE', 'SUSPENDED', 'REVOKED', 'PENDING_PASSWORD_SETUP')),
  profile_photo_reference TEXT,
  created_at              INTEGER NOT NULL,
  updated_at              INTEGER NOT NULL,
  last_login_at           INTEGER
);

-- ----------------------------------------------------------
-- User ↔ Role mapping
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ----------------------------------------------------------
-- User ↔ Department mapping
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_departments (
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, department_id)
);

-- ----------------------------------------------------------
-- Role ↔ Permission mapping
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ----------------------------------------------------------
-- Sessions
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  INTEGER NOT NULL,
  created_at  INTEGER NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT
);

-- ----------------------------------------------------------
-- Password Reset Tokens
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_hash TEXT    PRIMARY KEY,
  user_id    TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  used_at    INTEGER
);

-- ----------------------------------------------------------
-- Audit Logs
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id         TEXT    PRIMARY KEY,
  timestamp  INTEGER NOT NULL,
  user_id    TEXT    REFERENCES users(id) ON DELETE SET NULL,
  action     TEXT    NOT NULL,
  details    TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- ----------------------------------------------------------
-- Security Events
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_events (
  id         TEXT    PRIMARY KEY,
  timestamp  INTEGER NOT NULL,
  event_type TEXT    NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  details    TEXT
);

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_account_status  ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id      ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at   ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp  ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_events_ts    ON security_events(timestamp);

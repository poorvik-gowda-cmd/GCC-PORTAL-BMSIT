-- ==========================================================
-- GCC Portal - D1 Database Schema
-- Migration 005: Collaborations (MoUs) & Opportunities
-- ==========================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------
-- Collaborations & Institutional MoUs
-- Managed by Executive Council, Super Admin, and Research & Publication Team
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS collaborations (
  id           TEXT    NOT NULL PRIMARY KEY,
  title        TEXT    NOT NULL,
  institution  TEXT    NOT NULL,
  description  TEXT    NOT NULL,
  mou_file_url TEXT,              -- PDF / Photo document link
  image_url    TEXT,              -- Institution logo or photo
  status       TEXT    NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','UPCOMING','IN_REVIEW')),
  published_by TEXT    NOT NULL REFERENCES users(id),
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);

-- ----------------------------------------------------------
-- Opportunities & Announcements
-- Managed by Executive Council, Super Admin, and Research & Publication Team
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS opportunities (
  id             TEXT    NOT NULL PRIMARY KEY,
  title          TEXT    NOT NULL,
  category       TEXT    NOT NULL CHECK(category IN ('FELLOWSHIP','RESEARCH_GRANT','EXCHANGE_PROGRAM','INTERNSHIP','OTHER')),
  description    TEXT    NOT NULL,
  deadline       TEXT,
  apply_url      TEXT,
  attachment_url TEXT,            -- PDF / Photo flyer attachment
  published_by   TEXT    NOT NULL REFERENCES users(id),
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);

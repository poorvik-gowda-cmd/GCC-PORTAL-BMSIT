-- Migration 005: Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  task_id          TEXT    PRIMARY KEY,
  title            TEXT    NOT NULL,
  description      TEXT    NOT NULL DEFAULT '',
  department       TEXT    NOT NULL,
  assigned_to      TEXT    NOT NULL,
  assigned_to_name TEXT    NOT NULL,
  assigned_by      TEXT    NOT NULL,
  deadline         TEXT    NOT NULL,
  priority         TEXT    NOT NULL DEFAULT 'MEDIUM',
  status           TEXT    NOT NULL DEFAULT 'NOT_STARTED',
  latest_update    TEXT,
  president_remark TEXT,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL,
  completed_at     INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tasks_department   ON tasks(department);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to  ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status       ON tasks(status);

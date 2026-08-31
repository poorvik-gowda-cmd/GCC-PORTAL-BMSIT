-- ==========================================================
-- GCC Portal — Seed Production Data for Remote D1 Database
-- packages/database/seed_production.sql
-- ==========================================================

-- Standard departments
INSERT OR IGNORE INTO departments (id, name, description) VALUES
  ('EXECUTIVE_COUNCIL', 'Executive Council', 'Core leadership and operations coordination overseeing all GCC activities, MoUs, and task allocations.'),
  ('EVENTS_OPERATIONS', 'Events & Operations', 'Event planning, registration management, operational planning, attendance tracking, and feedback collection.'),
  ('TECHNICAL', 'Technical', 'Event technology, website development, system maintenance, QR code registries, and tech project tracking.'),
  ('MARKETING', 'Marketing', 'Brand communication, promotional campaigns, social media outreach, and event promotion.'),
  ('DESIGN', 'Design', 'Visual design, poster creation, banners, creative requests, and visual brand assets.'),
  ('PHOTOGRAPHY', 'Photography', 'Media coverage, event photography, videography archiving, and visual content management.');

-- Super Administrator User (DO NOT overwrite existing password_hash if user exists)
INSERT INTO users (id, email, password_hash, full_name, account_status, created_at, updated_at)
VALUES ('USER-SUPERADMIN-01', 'superadmin@bmsit.in', 'pbkdf2:100000:99650c11981e882ec76d2ddf04432192c586861c9ddd907d31157b0d6e592f5e', 'Super Administrator', 'ACTIVE', 0, 0)
ON CONFLICT(email) DO UPDATE SET account_status='ACTIVE';

INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES ('USER-SUPERADMIN-01', 'SYSTEM_SUPER_ADMIN');
INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES ('USER-SUPERADMIN-01', 'EXECUTIVE_COUNCIL');
INSERT OR IGNORE INTO user_departments (user_id, department_id) VALUES ('USER-SUPERADMIN-01', 'EXECUTIVE_COUNCIL');

-- Normal Member User
INSERT INTO users (id, email, password_hash, full_name, account_status, created_at, updated_at)
VALUES ('USER-NORMAL-01', 'normaluser@bmsit.in', 'pbkdf2:100000:99650c11981e882ec76d2ddf04432192c586861c9ddd907d31157b0d6e592f5e', 'Normal Member', 'ACTIVE', 0, 0)
ON CONFLICT(email) DO UPDATE SET account_status='ACTIVE';

INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES ('USER-NORMAL-01', 'DEPARTMENT_MEMBER');
INSERT OR IGNORE INTO user_departments (user_id, department_id) VALUES ('USER-NORMAL-01', 'MARKETING');

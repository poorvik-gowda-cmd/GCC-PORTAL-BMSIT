-- ==========================================================
-- GCC Portal — Seed Production Data for Remote D1 Database
-- packages/database/seed_production.sql
-- ==========================================================

-- Standard hash for password "Password123!"
-- PBKDF2 with 310,000 iterations
-- Salt: a166c096fcfdec217dbc09ba3df74d1e01e4ade8e2ba85a1d9af8f06ce1af8de

-- 1. Ensure Standard Departments exist
INSERT OR IGNORE INTO departments (id, name, description) VALUES
  ('EXECUTIVE_COUNCIL', 'Executive Council', 'Core leadership and operations coordination overseeing all GCC activities, MoUs, and task allocations.'),
  ('EVENTS_OPERATIONS', 'Events & Operations', 'Event planning, registration management, operational planning, attendance tracking, and feedback collection.'),
  ('TECHNICAL', 'Technical', 'Event technology, website development, system maintenance, QR code registries, and tech project tracking.'),
  ('MARKETING', 'Marketing', 'Brand communication, promotional campaigns, social media outreach, and event promotion.'),
  ('DESIGN', 'Design', 'Visual design, poster creation, banners, creative requests, and visual brand assets.'),
  ('PHOTOGRAPHY', 'Photography', 'Media coverage, event photography, videography archiving, and visual content management.');

-- 2. Super Administrator User
INSERT INTO users (id, email, password_hash, full_name, account_status, created_at, updated_at)
VALUES ('USER-SUPERADMIN-01', 'superadmin@bmsit.in', 'pbkdf2:310000:a166c096fcfdec217dbc09ba3df74d1e01e4ade8e2ba85a1d9af8f06ce1af8de', 'Super Administrator', 'ACTIVE', 0, 0)
ON CONFLICT(email) DO UPDATE SET password_hash='pbkdf2:310000:a166c096fcfdec217dbc09ba3df74d1e01e4ade8e2ba85a1d9af8f06ce1af8de', account_status='ACTIVE';

INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES ('USER-SUPERADMIN-01', 'SYSTEM_SUPER_ADMIN');
INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES ('USER-SUPERADMIN-01', 'EXECUTIVE_COUNCIL');
INSERT OR IGNORE INTO user_departments (user_id, department_id) VALUES ('USER-SUPERADMIN-01', 'EXECUTIVE_COUNCIL');

-- 3. Normal Member User
INSERT INTO users (id, email, password_hash, full_name, account_status, created_at, updated_at)
VALUES ('USER-NORMAL-01', 'normaluser@bmsit.in', 'pbkdf2:310000:a166c096fcfdec217dbc09ba3df74d1e01e4ade8e2ba85a1d9af8f06ce1af8de', 'Normal Member', 'ACTIVE', 0, 0)
ON CONFLICT(email) DO UPDATE SET password_hash='pbkdf2:310000:a166c096fcfdec217dbc09ba3df74d1e01e4ade8e2ba85a1d9af8f06ce1af8de', account_status='ACTIVE';

INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES ('USER-NORMAL-01', 'DEPARTMENT_MEMBER');
INSERT OR IGNORE INTO user_departments (user_id, department_id) VALUES ('USER-NORMAL-01', 'MARKETING');

-- 4. Sample Flagship Published Event
INSERT INTO events (event_id, title, short_description, full_description, category, venue, start_date, end_date, registration_status, event_status, capacity, registered_count, created_by, created_at, updated_at)
VALUES ('EVENT-2026-001', 'GCC Global Opportunities Summit 2026', 'Flagship international summit bringing global universities, fellowships, and research opportunities to BMSIT students.', 'Join us for the premier Global Collaboration Cell annual summit featuring guest speakers from top partner international universities.', 'TECH', 'BMSIT Auditorium', '2026-09-15T09:00:00Z', '2026-09-15T17:00:00Z', 'OPEN', 'PUBLISHED', 500, 0, 'USER-SUPERADMIN-01', 0, 0)
ON CONFLICT(event_id) DO UPDATE SET title='GCC Global Opportunities Summit 2026', event_status='PUBLISHED', registration_status='OPEN';

-- ==========================================================
-- GCC Portal — Migration 005: Standardize Department IDs
-- packages/database/migrations/005_standardize_departments.sql
-- ==========================================================

DELETE FROM user_departments;
DELETE FROM departments;

INSERT INTO departments (id, name, description) VALUES
  ('EXECUTIVE_COUNCIL', 'Executive Council', 'Core leadership and operations coordination overseeing all GCC activities, MoUs, and task allocations.'),
  ('EVENTS_OPERATIONS', 'Events & Operations', 'Event planning, registration management, operational planning, attendance tracking, and feedback collection.'),
  ('TECHNICAL', 'Technical', 'Event technology, website development, system maintenance, QR code registries, and tech project tracking.'),
  ('MARKETING', 'Marketing', 'Brand communication, promotional campaigns, social media outreach, and event promotion.'),
  ('DESIGN', 'Design', 'Visual design, poster creation, banners, creative requests, and visual brand assets.'),
  ('PHOTOGRAPHY', 'Photography', 'Media coverage, event photography, videography archiving, and visual content management.');

-- Re-assign default department for seeded test users
INSERT OR IGNORE INTO user_departments (user_id, department_id) VALUES
  ('USER-NORMAL-01', 'MARKETING'),
  ('USER-SUPERADMIN-01', 'EXECUTIVE_COUNCIL');

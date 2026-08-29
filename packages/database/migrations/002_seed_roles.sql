-- ==========================================================
-- GCC Portal - D1 Seed: Roles, Departments, Permissions
-- Migration 002: Reference Data
-- ==========================================================

-- Departments
INSERT OR IGNORE INTO departments (id, name, description) VALUES
  ('EXECUTION_COUNCIL',   'Execution Council',    'Core leadership and operations coordination'),
  ('RESEARCH_PUBLICATION','Research & Publication','Academic research, papers, and publications'),
  ('MARKETING',           'Marketing',            'Brand communication and outreach'),
  ('DIGITAL_SYSTEMS',     'Digital Systems',      'Event tech, QR systems, digital operations'),
  ('DESIGN_CREATIVE',     'Design & Creative',    'Visual design and creative assets'),
  ('PHOTOGRAPHY_MEDIA',   'Photography & Media',  'Photography, videography, and media archive');

-- Roles
INSERT OR IGNORE INTO roles (id, name) VALUES
  ('SYSTEM_SUPER_ADMIN',  'System Super Admin'),
  ('EXECUTIVE_COUNCIL',   'Executive Council'),
  ('DEPARTMENT_LEAD',     'Department Lead'),
  ('DEPARTMENT_MEMBER',   'Department Member');

-- Permissions
INSERT OR IGNORE INTO permissions (id, description) VALUES
  ('TASK_ASSIGN_GLOBAL',        'Assign tasks to any member or department'),
  ('TASK_ASSIGN_DEPARTMENT',    'Assign tasks within own department'),
  ('TASK_VIEW_GLOBAL',          'View all tasks across all departments'),
  ('TASK_VIEW_DEPARTMENT',      'View tasks within own department'),
  ('TASK_UPDATE_OWN',           'Update status/progress of own assigned task'),
  ('TASK_REMARK',               'Add remarks to tasks'),
  ('EVENT_CREATE',              'Create new events'),
  ('EVENT_EDIT',                'Edit existing events'),
  ('EVENT_PUBLISH',             'Publish or unpublish events'),
  ('REGISTRATION_VIEW',         'View event registrations'),
  ('REGISTRATION_EXPORT',       'Export registration data'),
  ('ATTENDANCE_MANAGE',         'Mark and manage event attendance'),
  ('FEEDBACK_VIEW',             'View event feedback submissions'),
  ('MOU_VIEW',                  'View MOU records and metadata'),
  ('MOU_EDIT',                  'Edit MOU records'),
  ('RESEARCH_UPLOAD',           'Upload research documents'),
  ('RESEARCH_VIEW',             'View research records'),
  ('RESOURCE_VIEW_DEPARTMENT',  'View own department resources in Drive'),
  ('QR_GENERATE',               'Generate QR codes for events'),
  ('USER_MANAGE',               'Create, edit, suspend users'),
  ('ROLE_MANAGE',               'Assign or revoke roles'),
  ('AUDIT_VIEW',                'View audit logs'),
  ('ADMIN_ACTION',              'Perform admin-level operations');

-- Role → Permission assignments

-- SYSTEM_SUPER_ADMIN gets all permissions
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'SYSTEM_SUPER_ADMIN', id FROM permissions;

-- EXECUTIVE_COUNCIL permissions
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
  ('EXECUTIVE_COUNCIL', 'TASK_ASSIGN_GLOBAL'),
  ('EXECUTIVE_COUNCIL', 'TASK_VIEW_GLOBAL'),
  ('EXECUTIVE_COUNCIL', 'TASK_REMARK'),
  ('EXECUTIVE_COUNCIL', 'EVENT_CREATE'),
  ('EXECUTIVE_COUNCIL', 'EVENT_EDIT'),
  ('EXECUTIVE_COUNCIL', 'EVENT_PUBLISH'),
  ('EXECUTIVE_COUNCIL', 'REGISTRATION_VIEW'),
  ('EXECUTIVE_COUNCIL', 'REGISTRATION_EXPORT'),
  ('EXECUTIVE_COUNCIL', 'ATTENDANCE_MANAGE'),
  ('EXECUTIVE_COUNCIL', 'FEEDBACK_VIEW'),
  ('EXECUTIVE_COUNCIL', 'MOU_VIEW'),
  ('EXECUTIVE_COUNCIL', 'MOU_EDIT'),
  ('EXECUTIVE_COUNCIL', 'RESEARCH_VIEW'),
  ('EXECUTIVE_COUNCIL', 'RESOURCE_VIEW_DEPARTMENT'),
  ('EXECUTIVE_COUNCIL', 'QR_GENERATE'),
  ('EXECUTIVE_COUNCIL', 'AUDIT_VIEW');

-- DEPARTMENT_LEAD permissions
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
  ('DEPARTMENT_LEAD', 'TASK_ASSIGN_DEPARTMENT'),
  ('DEPARTMENT_LEAD', 'TASK_VIEW_DEPARTMENT'),
  ('DEPARTMENT_LEAD', 'TASK_UPDATE_OWN'),
  ('DEPARTMENT_LEAD', 'TASK_REMARK'),
  ('DEPARTMENT_LEAD', 'RESEARCH_UPLOAD'),
  ('DEPARTMENT_LEAD', 'RESEARCH_VIEW'),
  ('DEPARTMENT_LEAD', 'RESOURCE_VIEW_DEPARTMENT'),
  ('DEPARTMENT_LEAD', 'REGISTRATION_VIEW'),
  ('DEPARTMENT_LEAD', 'ATTENDANCE_MANAGE');

-- DEPARTMENT_MEMBER permissions
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
  ('DEPARTMENT_MEMBER', 'TASK_VIEW_DEPARTMENT'),
  ('DEPARTMENT_MEMBER', 'TASK_UPDATE_OWN'),
  ('DEPARTMENT_MEMBER', 'RESEARCH_VIEW'),
  ('DEPARTMENT_MEMBER', 'RESOURCE_VIEW_DEPARTMENT');

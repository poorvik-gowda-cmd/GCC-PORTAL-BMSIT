// ==========================================================
// GCC Portal — Public Members Directory Route
// apps/api/src/routes/members.ts
// ==========================================================

import { Hono } from 'hono';
import type { Env } from '../types/env';
import type { RoleId, DepartmentId } from '@gcc-portal/contracts';

export const membersRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/members — Public directory of active GCC leaders & members
membersRouter.get('/', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT 
       u.id, u.full_name, u.email, u.profile_photo_reference,
       (SELECT GROUP_CONCAT(r.name, ',') FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = u.id) as role_names_csv,
       (SELECT GROUP_CONCAT(d.name, ',') FROM user_departments ud JOIN departments d ON ud.department_id = d.id WHERE ud.user_id = u.id) as dept_names_csv,
       (SELECT GROUP_CONCAT(ur.role_id, ',') FROM user_roles ur WHERE ur.user_id = u.id) as roles_csv,
       (SELECT GROUP_CONCAT(ud.department_id, ',') FROM user_departments ud WHERE ud.user_id = u.id) as depts_csv
     FROM users u
     WHERE u.account_status = 'ACTIVE'
     ORDER BY u.full_name ASC`
  ).all<{
    id: string;
    full_name: string;
    email: string;
    profile_photo_reference: string | null;
    role_names_csv: string | null;
    dept_names_csv: string | null;
    roles_csv: string | null;
    depts_csv: string | null;
  }>();

  const members = result.results.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    profilePhotoReference: r.profile_photo_reference,
    roleNames: r.role_names_csv ? r.role_names_csv.split(',').filter(Boolean) : [],
    departmentNames: r.dept_names_csv ? r.dept_names_csv.split(',').filter(Boolean) : [],
    roles: (r.roles_csv ? r.roles_csv.split(',').filter(Boolean) : []) as RoleId[],
    departments: (r.depts_csv ? r.depts_csv.split(',').filter(Boolean) : []) as DepartmentId[],
  }));

  return c.json({ success: true, data: { members, count: members.length } });
});

// ==========================================================
// GCC Portal — RBAC Permission Checker
// packages/permissions/src/index.ts
// ==========================================================

import type { Permission, RoleId, DepartmentId, UserProfile } from '@gcc-portal/contracts';

export function hasPermission(user: UserProfile, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

export function isInDepartment(user: UserProfile, department: DepartmentId): boolean {
  return user.departments.includes(department);
}

export function hasRole(user: UserProfile, role: RoleId): boolean {
  return user.roles.includes(role);
}

export function canAccessDepartment(user: UserProfile, department: DepartmentId): boolean {
  if (
    user.roles.includes('SYSTEM_SUPER_ADMIN') ||
    user.roles.includes('EXECUTIVE_COUNCIL')
  ) {
    return true;
  }
  return isInDepartment(user, department);
}

export function canModifyTask(
  user: UserProfile,
  taskAssignedToUserId: string,
  isMutation: boolean
): boolean {
  if (
    user.roles.includes('SYSTEM_SUPER_ADMIN') ||
    user.roles.includes('EXECUTIVE_COUNCIL')
  ) {
    return true;
  }
  if (isMutation) {
    return user.id === taskAssignedToUserId;
  }
  return false;
}

export function canAddRemark(user: UserProfile): boolean {
  return hasPermission(user, 'TASK_REMARK');
}

export function computeIsOverdue(deadlineIso: string, status: string): boolean {
  if (status === 'COMPLETED') return false;
  return new Date(deadlineIso).getTime() < Date.now();
}

export type { Permission, RoleId, DepartmentId, UserProfile };
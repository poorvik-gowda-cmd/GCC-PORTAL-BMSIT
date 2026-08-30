import { describe, it, expect } from "vitest";
import { hasPermission, canAccessDepartment, canModifyTask, computeIsOverdue } from "../../packages/permissions/src/index";
import type { UserProfile } from "../../packages/contracts/src/types";

describe("RBAC Permissions & Department Isolation", () => {
  const memberUser: UserProfile = {
    id: "USER-001",
    email: "member@bmsit.in",
    fullName: "Member One",
    accountStatus: "ACTIVE",
    roles: ["DEPARTMENT_MEMBER"],
    departments: ["MARKETING"],
    permissions: ["TASK_VIEW_DEPARTMENT", "TASK_UPDATE_OWN"],
  };

  const execUser: UserProfile = {
    id: "USER-002",
    email: "exec@bmsit.in",
    fullName: "Executive Chair",
    accountStatus: "ACTIVE",
    roles: ["EXECUTIVE_COUNCIL"],
    departments: ["EXECUTIVE_COUNCIL"],
    permissions: ["TASK_ASSIGN_GLOBAL", "TASK_VIEW_GLOBAL", "TASK_REMARK"],
  };

  const superAdminUser: UserProfile = {
    id: "USER-000",
    email: "superadmin@bmsit.in",
    fullName: "Super Administrator",
    accountStatus: "ACTIVE",
    roles: ["SYSTEM_SUPER_ADMIN"],
    departments: [],
    permissions: ["USER_MANAGE", "ROLE_MANAGE", "AUDIT_VIEW", "ADMIN_ACTION"],
  };

  it("should prevent Department Member from accessing unrelated department resources", () => {
    expect(canAccessDepartment(memberUser, "MARKETING")).toBe(true);
    expect(canAccessDepartment(memberUser, "TECHNICAL")).toBe(false);
  });

  it("should allow Executive Council and Super Admin to access all departments", () => {
    expect(canAccessDepartment(execUser, "MARKETING")).toBe(true);
    expect(canAccessDepartment(execUser, "TECHNICAL")).toBe(true);
    expect(canAccessDepartment(superAdminUser, "MARKETING")).toBe(true);
    expect(canAccessDepartment(superAdminUser, "TECHNICAL")).toBe(true);
  });

  it("should enforce task update IDOR restrictions", () => {
    // Member can update their own task
    expect(canModifyTask(memberUser, "USER-001", true)).toBe(true);
    // Member CANNOT update another member's task
    expect(canModifyTask(memberUser, "USER-999", true)).toBe(false);
    // Executive Council CAN update any task
    expect(canModifyTask(execUser, "USER-999", true)).toBe(true);
    // Super Admin CAN update any task
    expect(canModifyTask(superAdminUser, "USER-999", true)).toBe(true);
  });

  it("should compute overdue status correctly", () => {
    const pastDeadline = "2020-01-01T00:00:00Z";
    const futureDeadline = "2099-01-01T00:00:00Z";

    expect(computeIsOverdue(pastDeadline, "IN_PROGRESS")).toBe(true);
    expect(computeIsOverdue(pastDeadline, "COMPLETED")).toBe(false); // Completed tasks are never overdue
    expect(computeIsOverdue(futureDeadline, "IN_PROGRESS")).toBe(false);
  });
});
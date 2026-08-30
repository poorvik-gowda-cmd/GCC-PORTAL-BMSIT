// ==========================================================
// GCC Portal — Shared Enums and Domain Types
// packages/contracts/src/types.ts
// ==========================================================

export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  REVOKED: 'REVOKED',
  PENDING_PASSWORD_SETUP: 'PENDING_PASSWORD_SETUP',
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const RoleId = {
  SYSTEM_SUPER_ADMIN: 'SYSTEM_SUPER_ADMIN',
  EXECUTIVE_COUNCIL: 'EXECUTIVE_COUNCIL',
  DEPARTMENT_LEAD: 'DEPARTMENT_LEAD',
  DEPARTMENT_MEMBER: 'DEPARTMENT_MEMBER',
} as const;
export type RoleId = (typeof RoleId)[keyof typeof RoleId];

export const DepartmentId = {
  EXECUTIVE_COUNCIL: 'EXECUTIVE_COUNCIL',
  EVENTS_OPERATIONS: 'EVENTS_OPERATIONS',
  TECHNICAL: 'TECHNICAL',
  MARKETING: 'MARKETING',
  DESIGN: 'DESIGN',
  PHOTOGRAPHY: 'PHOTOGRAPHY',
} as const;
export type DepartmentId = (typeof DepartmentId)[keyof typeof DepartmentId];

export const Permission = {
  TASK_ASSIGN_GLOBAL: 'TASK_ASSIGN_GLOBAL',
  TASK_ASSIGN_DEPARTMENT: 'TASK_ASSIGN_DEPARTMENT',
  TASK_VIEW_GLOBAL: 'TASK_VIEW_GLOBAL',
  TASK_VIEW_DEPARTMENT: 'TASK_VIEW_DEPARTMENT',
  TASK_UPDATE_OWN: 'TASK_UPDATE_OWN',
  TASK_REMARK: 'TASK_REMARK',
  EVENT_CREATE: 'EVENT_CREATE',
  EVENT_EDIT: 'EVENT_EDIT',
  EVENT_PUBLISH: 'EVENT_PUBLISH',
  REGISTRATION_VIEW: 'REGISTRATION_VIEW',
  REGISTRATION_EXPORT: 'REGISTRATION_EXPORT',
  ATTENDANCE_MANAGE: 'ATTENDANCE_MANAGE',
  FEEDBACK_VIEW: 'FEEDBACK_VIEW',
  MOU_VIEW: 'MOU_VIEW',
  MOU_EDIT: 'MOU_EDIT',
  RESEARCH_UPLOAD: 'RESEARCH_UPLOAD',
  RESEARCH_VIEW: 'RESEARCH_VIEW',
  RESOURCE_VIEW_DEPARTMENT: 'RESOURCE_VIEW_DEPARTMENT',
  QR_GENERATE: 'QR_GENERATE',
  USER_MANAGE: 'USER_MANAGE',
  ROLE_MANAGE: 'ROLE_MANAGE',
  AUDIT_VIEW: 'AUDIT_VIEW',
  ADMIN_ACTION: 'ADMIN_ACTION',
} as const;
export type Permission = (typeof Permission)[keyof typeof Permission];

export const TaskStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  OVERDUE: 'OVERDUE',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const EventStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const RegistrationStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  FULL: 'FULL',
} as const;
export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export const MouStatus = {
  APPROVED: 'APPROVED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  EXPIRED: 'EXPIRED',
} as const;
export type MouStatus = (typeof MouStatus)[keyof typeof MouStatus];

export const AuditAction = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  ROLE_CHANGED: 'ROLE_CHANGED',
  DEPARTMENT_CHANGED: 'DEPARTMENT_CHANGED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  EVENT_CREATED: 'EVENT_CREATED',
  EVENT_PUBLISHED: 'EVENT_PUBLISHED',
  REGISTRATION_SUBMITTED: 'REGISTRATION_SUBMITTED',
  MOU_ACCESSED: 'MOU_ACCESSED',
  RESEARCH_UPLOADED: 'RESEARCH_UPLOADED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ADMIN_ACTION: 'ADMIN_ACTION',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  accountStatus: AccountStatus;
  profilePhotoReference?: string | null;
  roles: RoleId[];
  departments: DepartmentId[];
  permissions: Permission[];
  lastLoginAt?: number | null;
}

export interface Task {
  taskId: string;
  title: string;
  description: string;
  department: DepartmentId;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  latestUpdate?: string | null;
  presidentRemark?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface GccEvent {
  eventId: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  registrationStatus: RegistrationStatus;
  eventStatus: EventStatus;
  capacity?: number | null;
  bannerImageRef?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  registrationId: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  department?: string | null;
  customFields?: Record<string, string> | null;
  registeredAt: string;
}

export interface MouRecord {
  mouId: string;
  partnerInstitution: string;
  logoRef?: string | null;
  country: string;
  collaborationArea: string;
  startYear: number;
  endYear?: number | null;
  status: MouStatus;
  documentDriveId?: string | null;
}

export interface ResearchRecord {
  researchId: string;
  title: string;
  authors: string;
  abstract: string;
  publicationDate?: string | null;
  journalName?: string | null;
  status: string;
  documentDriveId?: string | null;
}

export interface QrRecord {
  qrId: string;
  targetType: 'REGISTER' | 'ATTENDANCE' | 'FEEDBACK';
  eventId: string;
  redirectUrl: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
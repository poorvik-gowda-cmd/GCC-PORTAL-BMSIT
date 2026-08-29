// ==========================================================
// GCC Portal — Shared Zod Validation Schemas
// packages/contracts/src/schemas.ts
// ==========================================================

import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;

export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const TaskStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']);
export const DepartmentIdSchema = z.enum([
  'EXECUTION_COUNCIL',
  'RESEARCH_PUBLICATION',
  'MARKETING',
  'DIGITAL_SYSTEMS',
  'DESIGN_CREATIVE',
  'PHOTOGRAPHY_MEDIA',
]);

export const CreateTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  department: DepartmentIdSchema,
  assignedTo: z.string().uuid('Invalid user ID'),
  deadline: z.string().datetime({ message: 'Invalid deadline datetime' }),
  priority: TaskPrioritySchema,
});
export type CreateTaskRequest = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  status: TaskStatusSchema.optional(),
  latestUpdate: z.string().max(1000).optional(),
}).refine((v) => Object.keys(v).length > 0, { message: 'At least one field required' });
export type UpdateTaskRequest = z.infer<typeof UpdateTaskSchema>;

export const AddRemarkSchema = z.object({
  remark: z.string().min(1).max(1000),
});
export type AddRemarkRequest = z.infer<typeof AddRemarkSchema>;

export const CreateEventSchema = z.object({
  title: z.string().min(3).max(200),
  shortDescription: z.string().min(10).max(500),
  fullDescription: z.string().min(10).max(10000),
  category: z.string().min(1).max(100),
  venue: z.string().min(1).max(200),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  capacity: z.number().int().positive().optional(),
  bannerImageRef: z.string().optional(),
});
export type CreateEventRequest = z.infer<typeof CreateEventSchema>;

export const EventRegistrationSchema = z.object({
  turnstileToken: z.string().min(1, 'Turnstile token required'),
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  collegeName: z.string().max(200).optional(),
  usn: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  customFields: z.record(z.string(), z.string().max(500)).optional(),
});
export type EventRegistrationRequest = z.infer<typeof EventRegistrationSchema>;

export const OpportunityFilterSchema = z.object({
  type: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export type OpportunityFilter = z.infer<typeof OpportunityFilterSchema>;
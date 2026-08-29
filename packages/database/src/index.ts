// ==========================================================
// GCC Portal — D1 Row Types and Query Helpers
// packages/database/src/index.ts
// ==========================================================

export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  account_status: string;
  profile_photo_reference: string | null;
  mfa_enabled: number;
  mfa_secret: string | null;
  mfa_enrolled_at: number | null;
  created_at: number;
  updated_at: number;
  last_login_at: number | null;
}

export interface DbSession {
  id: string;           // SHA-256(raw_token) — token hash stored, not plaintext
  user_id: string;
  expires_at: number;
  created_at: number;
  ip_address: string | null;
  user_agent: string | null;
}

export interface DbUserRole { user_id: string; role_id: string; }
export interface DbUserDepartment { user_id: string; department_id: string; }
export interface DbRolePermission { role_id: string; permission_id: string; }

export interface DbAuditLog {
  id: string;
  timestamp: number;
  user_id: string | null;
  action: string;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface DbPasswordResetToken {
  token_hash: string;
  user_id: string;
  expires_at: number;
  created_at: number;
  used_at: number | null;
}

export interface DbEvent {
  event_id: string;
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  venue: string;
  start_date: string;
  end_date: string;
  registration_status: string;
  event_status: string;
  capacity: number | null;
  registered_count: number;
  banner_image_ref: string | null;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface DbEventRegistration {
  registration_id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  college_name: string | null;
  usn: string | null;
  department: string | null;
  custom_fields: string | null; // JSON string
  registered_at: number;
}

export interface DbIdCounter {
  prefix: string;
  next_seq: number;
}

export interface DbCsrfToken {
  token_hash: string;
  session_id: string;
  created_at: number;
  expires_at: number;
}

export interface DbRateLimitEntry {
  key: string;
  window_start: number;
  count: number;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: Record<string, unknown> }>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean; meta: Record<string, unknown> }>;
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
  error?: string;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<{ count: number; duration: number }>;
  /** Execute multiple statements atomically (D1 batch). */
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}
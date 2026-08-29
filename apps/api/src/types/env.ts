// ==========================================================
// GCC Portal — Cloudflare Worker Environment Bindings
// apps/api/src/types/env.ts
// ==========================================================

export interface Env {
  // D1 Database binding
  DB: D1Database;

  // Worker secrets (set via wrangler secret put)
  SESSION_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;

  // Worker vars (set in wrangler.toml [vars])
  APP_ENV: string;
  ALLOWED_ORIGINS: string;
  GOOGLE_SHEETS_SPREADSHEET_ID: string;
  GOOGLE_DRIVE_ROOT_FOLDER_ID: string;
}

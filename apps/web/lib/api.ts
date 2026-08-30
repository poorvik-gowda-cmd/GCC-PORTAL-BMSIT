// ==========================================================
// GCC Portal — Centralized API Client
// apps/web/lib/api.ts
// ==========================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8787';

/** Cached CSRF token for the current session. Refreshed on 403 CSRF errors. */
let _csrfToken: string | null = null;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Fetch and cache a CSRF token from the backend. */
async function getCsrfToken(): Promise<string> {
  if (_csrfToken) return _csrfToken;

  const resp = await fetch(`${API_BASE}/api/v1/auth/csrf-token`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!resp.ok) {
    throw new ApiError(resp.status, 'CSRF_FETCH_FAILED', 'Could not obtain CSRF token');
  }

  const data: ApiResponse<{ csrfToken: string }> = await resp.json();
  if (!data.success || !data.data?.csrfToken) {
    throw new ApiError(resp.status, 'CSRF_FETCH_FAILED', 'Invalid CSRF token response');
  }

  _csrfToken = data.data.csrfToken;
  return _csrfToken;
}

/** Invalidate the cached CSRF token (call after 403 CSRF errors). */
export function invalidateCsrfToken(): void {
  _csrfToken = null;
}

/** Parse response — always returns the typed body or throws ApiError. */
async function parseResponse<T>(resp: Response): Promise<T> {
  let body: ApiResponse<T>;
  try {
    body = await resp.json();
  } catch {
    throw new ApiError(resp.status, 'PARSE_ERROR', 'Invalid server response');
  }

  if (!resp.ok || !body.success) {
    if (resp.status === 401 && !body.error) throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    if (resp.status === 403 && body.error?.code === 'CSRF_INVALID') {
      invalidateCsrfToken();
      throw new ApiError(403, 'CSRF_INVALID', 'Security token expired. Please retry.');
    }
    throw new ApiError(resp.status, body.error?.code ?? 'API_ERROR', body.error?.message ?? 'Request failed');
  }

  return body.data as T;
}

/** GET request — no CSRF token required. */
export async function apiGet<T>(path: string): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseResponse<T>(resp);
}

/** POST request — automatically includes X-CSRF-Token. */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  let csrf: string | undefined;
  try {
    csrf = await getCsrfToken();
  } catch {
    // If we can't get CSRF (e.g., unauthenticated), proceed without (backend will reject if needed)
  }

  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(resp);
}

/** PATCH request — automatically includes X-CSRF-Token. */
export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const csrf = await getCsrfToken();
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(resp);
}

/** DELETE request — automatically includes X-CSRF-Token. */
export async function apiDelete<T>(path: string): Promise<T> {
  const csrf = await getCsrfToken();
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrf },
  });
  return parseResponse<T>(resp);
}

/**
 * POST without CSRF (for public endpoints like login/registration/Turnstile flows
 * that are explicitly exempt in the backend csrf middleware).
 */
export async function apiPostPublic<T>(path: string, body?: unknown): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(resp);
}

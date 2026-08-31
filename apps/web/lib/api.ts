// ==========================================================
// GCC Portal — Centralized API Client
// apps/web/lib/api.ts
// ==========================================================

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gcc-portal-api-production.gcc-portal.workers.dev';

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

/** Get default request headers including optional Authorization Bearer token */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('gcc_session_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

/** Fetch and cache a CSRF token from the backend. */
async function getCsrfToken(): Promise<string> {
  if (_csrfToken) return _csrfToken;

  const resp = await fetch(`${API_BASE}/api/v1/auth/csrf-token`, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
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

/** Store session token for Bearer authentication fallback */
export function setStoredSessionToken(token: string | null): void {
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('gcc_session_token', token);
    } else {
      sessionStorage.removeItem('gcc_session_token');
    }
  }
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

/** GET request — credentialed fetch with optional Bearer token */
export async function apiGet<T>(path: string): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
  });
  return parseResponse<T>(resp);
}

/** POST request — automatically includes X-CSRF-Token & Bearer header */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  let csrf: string | undefined;
  try {
    csrf = await getCsrfToken();
  } catch {
    // Proceed without CSRF if unauthenticated (e.g. login)
  }

  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(resp);
}

/** PATCH request — automatically includes X-CSRF-Token & Bearer header */
export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const csrf = await getCsrfToken();
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
      'X-CSRF-Token': csrf,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(resp);
}

/** DELETE request — automatically includes X-CSRF-Token & Bearer header */
export async function apiDelete<T>(path: string): Promise<T> {
  const csrf = await getCsrfToken();
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
      'X-CSRF-Token': csrf,
    },
  });
  return parseResponse<T>(resp);
}

/** POST without CSRF (for public endpoints like login/registration) */
export async function apiPostPublic<T>(path: string, body?: unknown): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(resp);
}

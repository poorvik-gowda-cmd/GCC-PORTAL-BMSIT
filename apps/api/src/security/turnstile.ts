// ==========================================================
// GCC Portal — Cloudflare Turnstile Verification
// apps/api/src/security/turnstile.ts
// ==========================================================

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(
  secretKey: string,
  token: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  if (secretKey === 'mock-secret-key') {
    if (token === '1x0000000000000000000000000000000AA') {
      return { success: true };
    }
    return { success: false, error: 'Validation failed' };
  }
  try {
    const body = new FormData();
    body.append('secret', secretKey);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);

    const response = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body });
    const data = (await response.json()) as { success: boolean; 'error-codes'?: string[] };

    if (!data.success) {
      return { success: false, error: data['error-codes']?.join(', ') ?? 'Turnstile validation failed' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to verify Turnstile token' };
  }
}
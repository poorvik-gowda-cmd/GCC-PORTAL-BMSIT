// ==========================================================
// GCC Portal — Google Service Account JWT Auth
// packages/google-adapters/src/googleAuth.ts
// ==========================================================

export interface ServiceAccountCredentials {
  clientEmail: string;
  privateKey: string;
}

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// In-memory token cache keyed by clientEmail.
// Cloudflare Workers share this cache within an isolate lifetime.
// This eliminates the round-trip to Google on every Sheets/Drive operation.
interface CachedToken {
  accessToken: string;
  expiresAtMs: number; // wall-clock ms
}
const _tokenCache = new Map<string, CachedToken>();
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry
const FETCH_TIMEOUT_MS = 10_000;

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN (RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (RSA )?PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');

  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function base64urlEncode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function getGoogleAccessToken(
  credentials: ServiceAccountCredentials,
  scopes: string[]
): Promise<string> {
  const cacheKey = `${credentials.clientEmail}:${scopes.sort().join(',')}`;

  // Return cached token if still valid
  const cached = _tokenCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAtMs - TOKEN_REFRESH_BUFFER_MS) {
    return cached.accessToken;
  }

  // Build and sign JWT
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = base64urlEncode(
    new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).buffer as ArrayBuffer
  );

  const claimSet = base64urlEncode(
    new TextEncoder().encode(
      JSON.stringify({
        iss: credentials.clientEmail,
        scope: scopes.join(' '),
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp,
      })
    ).buffer as ArrayBuffer
  );

  const signingInput = `${header}.${claimSet}`;
  const privateKey = await importPrivateKey(credentials.privateKey);

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput).buffer as ArrayBuffer
  );

  const jwt = `${signingInput}.${base64urlEncode(signatureBuffer)}`;

  // Exchange JWT for access token
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let tokenResp: Response;
  try {
    tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    const msg = err instanceof Error && err.name === 'AbortError'
      ? 'Google OAuth2 token request timed out'
      : 'Google OAuth2 token request failed';
    throw new Error(msg); // Never expose underlying network details
  } finally {
    clearTimeout(timeoutId);
  }

  if (!tokenResp.ok) {
    // Log internally but don't expose Google's error to callers
    const status = tokenResp.status;
    console.error(`[GoogleAuth] Token exchange failed: HTTP ${status}`);
    throw new Error(`Google OAuth2 token exchange failed (HTTP ${status})`);
  }

  const tokenData = (await tokenResp.json()) as GoogleTokenResponse;
  const accessToken = tokenData.access_token;

  // Cache with expiry (tokens are valid for 3600s; buffer 5 min)
  _tokenCache.set(cacheKey, {
    accessToken,
    expiresAtMs: Date.now() + tokenData.expires_in * 1000,
  });

  return accessToken;
}

// ==========================================================
// GCC Portal — TOTP & Recovery Code Security Module (RFC 6238)
// apps/api/src/security/totp.ts
// ==========================================================

import { sha256Hex } from './crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += ALPHABET[(bytes[i] ?? 0) % 32];
  }
  return result;
}

function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = ALPHABET.indexOf(clean[i] ?? '');
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  return bytes;
}

export async function generateTOTP(secret: string, timeStep?: number): Promise<string> {
  const step = timeStep ?? Math.floor(Date.now() / 1000 / 30);
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(step), false); // Big endian

  const secretBytes = base32ToBytes(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const hmac = await crypto.subtle.sign('HMAC', key, buffer);
  const hmacBytes = new Uint8Array(hmac);
  const offset = (hmacBytes[hmacBytes.length - 1] ?? 0) & 0x0f;

  const binary =
    (((hmacBytes[offset] ?? 0) & 0x7f) << 24) |
    (((hmacBytes[offset + 1] ?? 0) & 0xff) << 16) |
    (((hmacBytes[offset + 2] ?? 0) & 0xff) << 8) |
    ((hmacBytes[offset + 3] ?? 0) & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

export async function verifyTOTP(secret: string, code: string, window = 1): Promise<boolean> {
  const currentStep = Math.floor(Date.now() / 1000 / 30);
  const cleanCode = code.trim();

  for (let i = -window; i <= window; i++) {
    const expected = await generateTOTP(secret, currentStep + i);
    if (expected === cleanCode) {
      return true;
    }
  }
  return false;
}

export async function generateRecoveryCodes(count = 8): Promise<{ plainCodes: string[]; hashedCodes: string[] }> {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const bytes = crypto.getRandomValues(new Uint8Array(5));
    const code = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    plainCodes.push(code);
    hashedCodes.push(await sha256Hex(code));
  }

  return { plainCodes, hashedCodes };
}

export function buildOtpauthUrl(email: string, secret: string, issuer = 'BMSIT GCC Portal'): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
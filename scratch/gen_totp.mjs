import { webcrypto } from "crypto";

const crypto = webcrypto;

function base32Decode(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = base32.toUpperCase().replace(/=/g, "").replace(/[^A-Z2-7]/g, "");
  const bits = [];
  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) continue;
    for (let b = 4; b >= 0; b--) {
      bits.push((val >> b) & 1);
    }
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | bits[i * 8 + b];
    }
    bytes[i] = byte;
  }
  return bytes;
}

async function generateTOTP(secret, timeStepSeconds = 30) {
  const keyBytes = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / timeStepSeconds);

  const counterBuffer = new ArrayBuffer(8);
  const dataView = new DataView(counterBuffer);
  dataView.setBigUint64(0, BigInt(counter), false);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const hmac = await crypto.subtle.sign("HMAC", cryptoKey, counterBuffer);
  const hmacBytes = new Uint8Array(hmac);
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;

  const binary =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const code = (binary % 1000000).toString().padStart(6, "0");
  return code;
}

const secret = "JBSWY3DPEHPK3PXP";
const currentCode = await generateTOTP(secret);
console.log("CURRENT 6-DIGIT TOTP CODE:", currentCode);

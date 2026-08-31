import { webcrypto } from "crypto";

const crypto = webcrypto;

function hexToBuffer(hex) {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyPassword(password, storedHash) {
  const parts = storedHash.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;

  const iterations = parseInt(parts[1] ?? "0", 10);
  const saltHex = parts[2] ?? "";
  const expectedHashHex = parts[3] ?? "";

  if (!iterations || !saltHex || !expectedHashHex) return false;

  const salt = hexToBuffer(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hashHex = bufferToHex(hashBuffer);
  return constantTimeEqual(hashHex, expectedHashHex);
}

const hash = "pbkdf2:100000:99650c11981e882ec76d2ddf04432192c586861c9ddd907d31157b0d6e592f5e:3a6d2ca4b285f19ba11e575e5c51de31ac032c2702ae2d90dc774354e568debb";

const match = await verifyPassword("Password123!", hash);
console.log("VERIFY Password123! MATCH:", match);

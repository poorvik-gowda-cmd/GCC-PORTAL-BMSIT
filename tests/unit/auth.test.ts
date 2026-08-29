import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateSessionToken, sha256Hex } from "../../apps/api/src/security/crypto";

describe("Crypto Security & Authentication", () => {
  it("should securely hash a password and verify correctly", async () => {
    const password = "StrongPassword@2026!";
    const hash = await hashPassword(password);

    expect(hash).toContain("pbkdf2:310000:");

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);

    const isWrongValid = await verifyPassword("WrongPassword@123", hash);
    expect(isWrongValid).toBe(false);
  });

  it("should generate cryptographically high-entropy session tokens", () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("should securely hash session tokens using SHA-256", async () => {
    const token = generateSessionToken();
    const hashed = await sha256Hex(token);

    expect(hashed).toHaveLength(64);
    expect(hashed).not.toBe(token);

    const hashed2 = await sha256Hex(token);
    expect(hashed).toBe(hashed2);
  });
});
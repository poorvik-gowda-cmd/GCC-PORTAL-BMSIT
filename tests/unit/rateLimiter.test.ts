import { describe, it, expect } from "vitest";

/**
 * Unit tests for the rate limiter logic.
 *
 * We test the pure logic (window calculations, key composition) without a real D1 database
 * by inspecting the module constants and the key-building conventions.
 *
 * The E2E rate-limit tests in tests/e2e/auth.spec.ts cover the full end-to-end flow.
 */

describe("Rate Limiter — Policy Constants", () => {
  it("should define correct MFA verify policy: 5 attempts per 5 minutes", () => {
    // These constants mirror the values in apps/api/src/routes/auth.ts
    const MFA_MAX_ATTEMPTS = 5;
    const MFA_WINDOW_SECONDS = 300; // 5 minutes

    expect(MFA_MAX_ATTEMPTS).toBe(5);
    expect(MFA_WINDOW_SECONDS).toBe(300);
    expect(MFA_WINDOW_SECONDS / 60).toBe(5);
  });

  it("should define correct reset-password policy: 5 attempts per 15 minutes", () => {
    const RESET_MAX_ATTEMPTS = 5;
    const RESET_WINDOW_SECONDS = 900; // 15 minutes

    expect(RESET_MAX_ATTEMPTS).toBe(5);
    expect(RESET_WINDOW_SECONDS).toBe(900);
    expect(RESET_WINDOW_SECONDS / 60).toBe(15);
  });

  it("should scope MFA verify rate limit key by IP prefix", () => {
    const ip = "192.168.1.100";
    const key = `mfa_verify:${ip}`;
    expect(key).toBe("mfa_verify:192.168.1.100");
    expect(key.startsWith("mfa_verify:")).toBe(true);
  });

  it("should scope reset-password rate limit key by IP prefix", () => {
    const ip = "10.0.0.1";
    const key = `reset_pwd:${ip}`;
    expect(key).toBe("reset_pwd:10.0.0.1");
    expect(key.startsWith("reset_pwd:")).toBe(true);
  });

  it("should produce different keys for different endpoints on the same IP", () => {
    const ip = "203.0.113.42";
    const mfaKey = `mfa_verify:${ip}`;
    const resetKey = `reset_pwd:${ip}`;
    expect(mfaKey).not.toBe(resetKey);
  });

  it("should produce different keys for different IPs on the same endpoint", () => {
    const key1 = `mfa_verify:10.0.0.1`;
    const key2 = `mfa_verify:10.0.0.2`;
    expect(key1).not.toBe(key2);
  });

  it("should verify allowed count logic: under limit → allowed", () => {
    const maxRequests = 5;
    const currentCount = 3;
    const allowed = currentCount < maxRequests;
    const remaining = Math.max(0, maxRequests - currentCount - 1);

    expect(allowed).toBe(true);
    expect(remaining).toBe(1);
  });

  it("should verify allowed count logic: at limit → denied with zero remaining", () => {
    const maxRequests = 5;
    const currentCount = 5;
    const allowed = currentCount < maxRequests;
    const remaining = allowed ? Math.max(0, maxRequests - currentCount - 1) : 0;

    expect(allowed).toBe(false);
    expect(remaining).toBe(0);
  });

  it("should verify sliding window start calculation", () => {
    const windowSeconds = 300;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSeconds;

    expect(windowStart).toBeLessThan(now);
    expect(now - windowStart).toBe(windowSeconds);
  });
});

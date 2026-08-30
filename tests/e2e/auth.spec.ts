import { test, expect } from "@playwright/test";

test.describe("Authentication E2E Suite", () => {
  // Seeding is done by global-setup.ts before the API server starts.

  test("should fail login with unknown email", async ({ page }) => {
    await page.goto("/portal/login");
    await page.fill('input[type="email"]', "unknown@bmsit.in");
    await page.fill('input[type="password"]', "Password123!");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL("/portal/login");
  });

  test("should fail login with wrong password", async ({ page }) => {
    await page.goto("/portal/login");
    await page.fill('input[type="email"]', "member@bmsit.in");
    await page.fill('input[type="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL("/portal/login");
  });

  test("should reject suspended account login", async ({ request }) => {
    const response = await request.post("http://127.0.0.1:8787/api/v1/auth/login", {
      data: { email: "suspended@bmsit.in", password: "Password123!" },
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("ACCOUNT_SUSPENDED");
  });

  test("should reject revoked account login", async ({ request }) => {
    const response = await request.post("http://127.0.0.1:8787/api/v1/auth/login", {
      data: { email: "revoked@bmsit.in", password: "Password123!" },
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("ACCOUNT_REVOKED");
  });

  test.describe("Rate Limiting", () => {
    test("should rate-limit MFA verify after 5 failed attempts", async ({ request }) => {
      // Use a fake MFA session token — each attempt will fail with INVALID_TOKEN (401) for the first
      // 5 tries, then return 429 on the 6th (rate limit fires before token validation).
      const badPayload = { mfaSessionToken: "fake-mfa-token-rate-limit-test", totpCode: "000000" };
      const statuses: number[] = [];

      for (let i = 0; i < 6; i++) {
        const res = await request.post("http://127.0.0.1:8787/api/v1/auth/mfa/verify", {
          data: badPayload,
        });
        statuses.push(res.status());
      }

      // At least one response in the sequence must be 429 (rate limit enforced)
      expect(statuses).toContain(429);
      // None should be 200 (no successful logins with bad data)
      expect(statuses).not.toContain(200);
    });

    test("should rate-limit reset-password after 5 failed attempts", async ({ request }) => {
      const badPayload = { token: "invalid-reset-token", newPassword: "NewPassword@2026!" };
      const statuses: number[] = [];

      for (let i = 0; i < 6; i++) {
        const res = await request.post("http://127.0.0.1:8787/api/v1/auth/reset-password", {
          data: badPayload,
        });
        statuses.push(res.status());
      }

      // At least one response must be 429
      expect(statuses).toContain(429);
    });

    test("forgot-password should always return generic success (no account enumeration)", async ({ request }) => {
      const res = await request.post("http://127.0.0.1:8787/api/v1/auth/forgot-password", {
        data: { email: "definitelydoesnotexist12345@bmsit.in" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.message).toMatch(/If an account exists/i);
    });
  });
});
import { test, expect } from "@playwright/test";

// Seeding is done by global-setup.ts before the API server starts.

test.describe("Event Registration & Bot Guard E2E Suite", () => {
  test("should display published events on public page", async ({ page }) => {
    await page.goto("/events");
    await expect(page.locator("text=GCC Global Opportunities Summit 2026")).toBeVisible({ timeout: 10000 });
  });

  test("should reject event registration with invalid turnstile token", async ({ request }) => {
    const response = await request.post("http://localhost:8787/api/v1/events/EVENT-2026-001/register", {
      data: {
        turnstileToken: "invalid_token",
        fullName: "Test User",
        email: "test@example.com",
        phone: "9876543210",
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  test.describe("Concurrency Tests", () => {
    // Concurrency events seeded by global-setup.ts — no wrangler CLI here.
    test("should handle concurrent capacity registrations correctly", async ({ request }) => {
      const req1 = request.post("http://localhost:8787/api/v1/events/EVENT-CAPACITY-001/register", {
        data: {
          turnstileToken: "1x0000000000000000000000000000000AA",
          fullName: "User One",
          email: "user1@example.com",
          phone: "9876543211",
        },
      });
      
      const req2 = request.post("http://localhost:8787/api/v1/events/EVENT-CAPACITY-001/register", {
        data: {
          turnstileToken: "1x0000000000000000000000000000000AA",
          fullName: "User Two",
          email: "user2@example.com",
          phone: "9876543212",
        },
      });

      const [res1, res2] = await Promise.all([req1, req2]);
      const statuses = [res1.status(), res2.status()];
      
      expect(statuses).toContain(201);
      expect(statuses.includes(400) || statuses.includes(409)).toBe(true);
    });

    test("should handle concurrent duplicate registrations correctly", async ({ request }) => {
      const req1 = request.post("http://localhost:8787/api/v1/events/EVENT-DUP-001/register", {
        data: {
          turnstileToken: "1x0000000000000000000000000000000AA",
          fullName: "Test Duplicate",
          email: "duplicate@example.com",
          phone: "9876543210",
        },
      });
      
      const req2 = request.post("http://localhost:8787/api/v1/events/EVENT-DUP-001/register", {
        data: {
          turnstileToken: "1x0000000000000000000000000000000AA",
          fullName: "Test Duplicate",
          email: "duplicate@example.com",
          phone: "9876543210",
        },
      });

      const [res1, res2] = await Promise.all([req1, req2]);
      const statuses = [res1.status(), res2.status()];
      
      expect(statuses).toContain(201);
      // The second duplicate must be rejected (409 conflict or 429 if rate-limited)
      expect(statuses.some(s => s === 409 || s === 429)).toBe(true);
    });
  });
});
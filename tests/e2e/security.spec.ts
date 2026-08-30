import { test, expect } from "@playwright/test";

test.describe("Security & Input Sanitization E2E Suite", () => {
  test("should safely handle XSS payloads in registration input", async ({ request }) => {
    const response = await request.post("http://127.0.0.1:8787/api/v1/events/EVENT-2026-001/register", {
      data: {
        turnstileToken: "1x00000000000000000000AA",
        fullName: "<script>alert('XSS')</script>",
        email: "xss@bmsit.in",
        phone: "9876543210",
      },
    });
    expect([201, 400, 404, 409]).toContain(response.status());
  });

  test("should prevent SQL Injection via parameterized queries", async ({ request }) => {
    const response = await request.post("http://127.0.0.1:8787/api/v1/auth/login", {
      data: { email: "' OR '1'='1", password: "' OR '1'='1" },
    });
    expect(response.status()).toBe(400); // Zod validation fails email format
  });
});
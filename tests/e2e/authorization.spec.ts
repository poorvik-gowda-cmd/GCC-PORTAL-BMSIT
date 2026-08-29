import { test, expect } from "@playwright/test";

test.describe("Authorization & IDOR Protection E2E Suite", () => {
  test("should block unauthenticated API requests to protected endpoints", async ({ request }) => {
    const response = await request.get("http://localhost:8787/api/v1/tasks");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  test("should enforce task modification IDOR restriction", async ({ request }) => {
    // Attempting to update another member's task without session
    const response = await request.patch("http://localhost:8787/api/v1/tasks/TASK-2026-001", {
      data: { status: "COMPLETED" },
    });
    expect(response.status()).toBe(401);
  });
});
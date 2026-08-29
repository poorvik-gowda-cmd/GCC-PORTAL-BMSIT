import { test, expect } from "@playwright/test";

// Seeding is done by global-setup.ts before the API server starts.

test.describe("Super Admin & Member Management E2E Suite", () => {
  test("1. Unauthenticated request to Super Admin APIs must return 401 UNAUTHORIZED", async ({ request }) => {
    const response = await request.get("http://localhost:8787/api/v1/admin/users");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  test("2. Normal authenticated user accessing Super Admin API must return 403 FORBIDDEN", async ({ request }) => {
    const loginRes = await request.post("http://localhost:8787/api/v1/auth/login", {
      data: { email: "normaluser@bmsit.in", password: "Password123!" },
    });
    expect(loginRes.status()).toBe(200);
    const cookie = loginRes.headers()["set-cookie"];

    const adminRes = await request.get("http://localhost:8787/api/v1/admin/users", {
      headers: { Cookie: cookie },
    });
    expect(adminRes.status()).toBe(403);
    const body = await adminRes.json();
    expect(body.error.code).toBe("FORBIDDEN");
  });

  test("3. SUPER_ADMIN can list and search users via API", async ({ request }) => {
    const loginRes = await request.post("http://localhost:8787/api/v1/auth/login", {
      data: { email: "superadmin@bmsit.in", password: "Password123!" },
    });
    expect(loginRes.status()).toBe(200);
    const cookie = loginRes.headers()["set-cookie"];

    const usersRes = await request.get("http://localhost:8787/api/v1/admin/users?q=normaluser", {
      headers: { Cookie: cookie },
    });
    expect(usersRes.status()).toBe(200);
    const body = await usersRes.json();
    expect(body.success).toBe(true);
    expect(body.data.users.length).toBeGreaterThanOrEqual(1);
    expect(body.data.users[0].email).toBe("normaluser@bmsit.in");
  });

  test("4. SUPER_ADMIN can change department assignment and it persists in D1", async ({ request }) => {
    const loginRes = await request.post("http://localhost:8787/api/v1/auth/login", {
      data: { email: "superadmin@bmsit.in", password: "Password123!" },
    });
    expect(loginRes.status()).toBe(200);
    const cookie = loginRes.headers()["set-cookie"];

    const csrfRes = await request.get("http://localhost:8787/api/v1/auth/csrf-token", {
      headers: { Cookie: cookie },
    });
    expect(csrfRes.status()).toBe(200);
    const csrfToken = (await csrfRes.json()).data.csrfToken;

    const updateRes = await request.post("http://localhost:8787/api/v1/admin/users/USER-NORMAL-01/department", {
      headers: { Cookie: cookie, "X-CSRF-Token": csrfToken },
      data: { departmentId: "DIGITAL_SYSTEMS" },
    });
    expect(updateRes.status()).toBe(200);

    const userRes = await request.get("http://localhost:8787/api/v1/admin/users/USER-NORMAL-01", {
      headers: { Cookie: cookie },
    });
    const userBody = await userRes.json();
    expect(userBody.data.user.departments).toContain("DIGITAL_SYSTEMS");
  });

  test("5. SUPER_ADMIN can assign/update roles and suspend account", async ({ request }) => {
    const loginRes = await request.post("http://localhost:8787/api/v1/auth/login", {
      data: { email: "superadmin@bmsit.in", password: "Password123!" },
    });
    expect(loginRes.status()).toBe(200);
    const cookie = loginRes.headers()["set-cookie"];

    const csrfRes = await request.get("http://localhost:8787/api/v1/auth/csrf-token", {
      headers: { Cookie: cookie },
    });
    expect(csrfRes.status()).toBe(200);
    const csrfToken = (await csrfRes.json()).data.csrfToken;

    const rolesRes = await request.post("http://localhost:8787/api/v1/admin/users/USER-NORMAL-01/roles", {
      headers: { Cookie: cookie, "X-CSRF-Token": csrfToken },
      data: { roles: ["DEPARTMENT_LEAD"] },
    });
    expect(rolesRes.status()).toBe(200);

    const statusRes = await request.post("http://localhost:8787/api/v1/admin/users/USER-NORMAL-01/status", {
      headers: { Cookie: cookie, "X-CSRF-Token": csrfToken },
      data: { status: "SUSPENDED" },
    });
    expect(statusRes.status()).toBe(200);

    // Reactivate
    await request.post("http://localhost:8787/api/v1/admin/users/USER-NORMAL-01/status", {
      headers: { Cookie: cookie, "X-CSRF-Token": csrfToken },
      data: { status: "ACTIVE" },
    });
  });

  test("6. Public members directory returns active members without auth", async ({ request }) => {
    const response = await request.get("http://localhost:8787/api/v1/members");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.members)).toBe(true);
  });
});

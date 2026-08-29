# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication E2E Suite >> should fail login with unknown email
- Location: tests\e2e\auth.spec.ts:6:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Invalid email or password')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Invalid email or password')

```

```yaml
- banner:
  - link "GCC BMSIT&M Global Collaboration Cell":
    - /url: /
  - navigation:
    - link "Vision":
      - /url: /vision
    - link "What We Do":
      - /url: /what-we-do
    - link "Opportunities":
      - /url: /opportunities
    - link "Events":
      - /url: /events
    - link "MOUs & Partners":
      - /url: /collaborations
    - link "Members":
      - /url: /members
  - link "Member Portal":
    - /url: /portal/login
    - button "Member Portal"
- main:
  - complementary:
    - text: GCC Member Portal BMSIT&M Internal Session error
    - navigation:
      - link "Dashboard":
        - /url: /portal/dashboard
      - link "Task Tracker":
        - /url: /portal/tasks
      - link "Event Desk":
        - /url: /portal/events
      - link "Department Desks":
        - /url: /portal/departments/DIGITAL_SYSTEMS
      - link "QR Manager":
        - /url: /portal/qr
    - link "← Back to Public Website":
      - /url: /
    - button "Sign Out"
  - main:
    - link "Return to Public GCC Website":
      - /url: /
    - heading "GCC Member Sign In" [level=3]
    - paragraph: Global Collaboration Cell — BMSIT&M Internal Portal
    - text: Unable to connect to authentication server. Please check your internet connection. GCC Email Address
    - textbox "member@bmsit.in": unknown@bmsit.in
    - text: Password
    - textbox "••••••••••••": Password123!
    - button "Sign In to Member Portal"
    - link "Forgot password?":
      - /url: /portal/forgot-password
    - strong: Strict Access Policy
    - text: Public signup is disabled. Accounts, roles, and permissions are controlled exclusively by administrators.
- contentinfo:
  - text: GCC BMSIT&M GCC
  - paragraph: Global Collaboration Cell at BMS Institute of Technology & Management. Bridging students with international universities, research fellowships, and global career opportunities.
  - text: Doddaballapur Main Road, Yelahanka, Bengaluru, Karnataka 560064
  - heading "Navigation" [level=4]
  - list:
    - listitem:
      - link "Vision & Mission":
        - /url: /vision
    - listitem:
      - link "What We Do":
        - /url: /what-we-do
    - listitem:
      - link "Global Opportunities":
        - /url: /opportunities
    - listitem:
      - link "Upcoming Events":
        - /url: /events
    - listitem:
      - link "MOUs Showcase":
        - /url: /collaborations
    - listitem:
      - link "GCC Team Directory":
        - /url: /members
  - heading "Opportunities" [level=4]
  - list:
    - listitem:
      - link "International Internships":
        - /url: /opportunities?type=internship
    - listitem:
      - link "University Scholarships":
        - /url: /opportunities?type=scholarship
    - listitem:
      - link "Research Grants & Fellowships":
        - /url: /opportunities?type=research
    - listitem:
      - link "Student Exchange Programs":
        - /url: /opportunities?type=exchange
    - listitem:
      - link "Global Hackathons":
        - /url: /opportunities?type=hackathon
  - heading "GCC Members" [level=4]
  - paragraph: Authorized GCC student representatives and faculty leads can log in to access task tracking, department desks, and operational records.
  - link "Member Portal Sign In":
    - /url: /portal/login
  - paragraph: © 2026 Global Collaboration Cell (GCC), BMSIT&M. All rights reserved.
  - text: Built for Global Excellence
  - link "BMSIT&M Website":
    - /url: https://bmsit.ac.in
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Authentication E2E Suite", () => {
  4  |   // Seeding is done by global-setup.ts before the API server starts.
  5  | 
  6  |   test("should fail login with unknown email", async ({ page }) => {
  7  |     await page.goto("/portal/login");
  8  |     await page.fill('input[type="email"]', "unknown@bmsit.in");
  9  |     await page.fill('input[type="password"]', "Password123!");
  10 |     await page.click('button[type="submit"]');
  11 | 
> 12 |     await expect(page.locator("text=Invalid email or password")).toBeVisible();
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  13 |     await expect(page).toHaveURL("/portal/login");
  14 |   });
  15 | 
  16 |   test("should fail login with wrong password", async ({ page }) => {
  17 |     await page.goto("/portal/login");
  18 |     await page.fill('input[type="email"]', "member@bmsit.in");
  19 |     await page.fill('input[type="password"]', "WrongPassword123!");
  20 |     await page.click('button[type="submit"]');
  21 | 
  22 |     await expect(page.locator("text=Invalid email or password")).toBeVisible();
  23 |     await expect(page).toHaveURL("/portal/login");
  24 |   });
  25 | 
  26 |   test("should reject suspended account login", async ({ request }) => {
  27 |     const response = await request.post("http://localhost:8787/api/v1/auth/login", {
  28 |       data: { email: "suspended@bmsit.in", password: "Password123!" },
  29 |     });
  30 |     expect(response.status()).toBe(403);
  31 |     const body = await response.json();
  32 |     expect(body.error.code).toBe("ACCOUNT_SUSPENDED");
  33 |   });
  34 | 
  35 |   test("should reject revoked account login", async ({ request }) => {
  36 |     const response = await request.post("http://localhost:8787/api/v1/auth/login", {
  37 |       data: { email: "revoked@bmsit.in", password: "Password123!" },
  38 |     });
  39 |     expect(response.status()).toBe(403);
  40 |     const body = await response.json();
  41 |     expect(body.error.code).toBe("ACCOUNT_REVOKED");
  42 |   });
  43 | 
  44 |   test.describe("Rate Limiting", () => {
  45 |     test("should rate-limit MFA verify after 5 failed attempts", async ({ request }) => {
  46 |       // Use a fake MFA session token — each attempt will fail with INVALID_TOKEN (401) for the first
  47 |       // 5 tries, then return 429 on the 6th (rate limit fires before token validation).
  48 |       const badPayload = { mfaSessionToken: "fake-mfa-token-rate-limit-test", totpCode: "000000" };
  49 |       const statuses: number[] = [];
  50 | 
  51 |       for (let i = 0; i < 6; i++) {
  52 |         const res = await request.post("http://localhost:8787/api/v1/auth/mfa/verify", {
  53 |           data: badPayload,
  54 |         });
  55 |         statuses.push(res.status());
  56 |       }
  57 | 
  58 |       // At least one response in the sequence must be 429 (rate limit enforced)
  59 |       expect(statuses).toContain(429);
  60 |       // None should be 200 (no successful logins with bad data)
  61 |       expect(statuses).not.toContain(200);
  62 |     });
  63 | 
  64 |     test("should rate-limit reset-password after 5 failed attempts", async ({ request }) => {
  65 |       const badPayload = { token: "invalid-reset-token", newPassword: "NewPassword@2026!" };
  66 |       const statuses: number[] = [];
  67 | 
  68 |       for (let i = 0; i < 6; i++) {
  69 |         const res = await request.post("http://localhost:8787/api/v1/auth/reset-password", {
  70 |           data: badPayload,
  71 |         });
  72 |         statuses.push(res.status());
  73 |       }
  74 | 
  75 |       // At least one response must be 429
  76 |       expect(statuses).toContain(429);
  77 |     });
  78 | 
  79 |     test("forgot-password should always return generic success (no account enumeration)", async ({ request }) => {
  80 |       const res = await request.post("http://localhost:8787/api/v1/auth/forgot-password", {
  81 |         data: { email: "definitelydoesnotexist12345@bmsit.in" },
  82 |       });
  83 |       expect(res.status()).toBe(200);
  84 |       const body = await res.json();
  85 |       expect(body.success).toBe(true);
  86 |       expect(body.data.message).toMatch(/If an account exists/i);
  87 |     });
  88 |   });
  89 | });
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: events.spec.ts >> Event Registration & Bot Guard E2E Suite >> should display published events on public page
- Location: tests\e2e\events.spec.ts:6:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=GCC Global Opportunities Summit 2026')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=GCC Global Opportunities Summit 2026')

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
  - text: GCC Event Calendar
  - heading "Upcoming GCC Events" [level=1]
  - paragraph: Register directly on our official GCC website. No external forms or third-party links required.
  - text: No upcoming events scheduled at this time. Check back later!
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
  3  | // Seeding is done by global-setup.ts before the API server starts.
  4  | 
  5  | test.describe("Event Registration & Bot Guard E2E Suite", () => {
  6  |   test("should display published events on public page", async ({ page }) => {
  7  |     await page.goto("/events");
> 8  |     await expect(page.locator("text=GCC Global Opportunities Summit 2026")).toBeVisible({ timeout: 10000 });
     |                                                                             ^ Error: expect(locator).toBeVisible() failed
  9  |   });
  10 | 
  11 |   test("should reject event registration with invalid turnstile token", async ({ request }) => {
  12 |     const response = await request.post("http://localhost:8787/api/v1/events/EVENT-2026-001/register", {
  13 |       data: {
  14 |         turnstileToken: "invalid_token",
  15 |         fullName: "Test User",
  16 |         email: "test@example.com",
  17 |         phone: "9876543210",
  18 |       },
  19 |     });
  20 |     expect(response.status()).toBe(400);
  21 |     const body = await response.json();
  22 |     expect(body.error.code).toBe("VALIDATION_ERROR");
  23 |   });
  24 | 
  25 |   test.describe("Concurrency Tests", () => {
  26 |     // Concurrency events seeded by global-setup.ts — no wrangler CLI here.
  27 |     test("should handle concurrent capacity registrations correctly", async ({ request }) => {
  28 |       const req1 = request.post("http://localhost:8787/api/v1/events/EVENT-CAPACITY-001/register", {
  29 |         data: {
  30 |           turnstileToken: "1x0000000000000000000000000000000AA",
  31 |           fullName: "User One",
  32 |           email: "user1@example.com",
  33 |           phone: "9876543211",
  34 |         },
  35 |       });
  36 |       
  37 |       const req2 = request.post("http://localhost:8787/api/v1/events/EVENT-CAPACITY-001/register", {
  38 |         data: {
  39 |           turnstileToken: "1x0000000000000000000000000000000AA",
  40 |           fullName: "User Two",
  41 |           email: "user2@example.com",
  42 |           phone: "9876543212",
  43 |         },
  44 |       });
  45 | 
  46 |       const [res1, res2] = await Promise.all([req1, req2]);
  47 |       const statuses = [res1.status(), res2.status()];
  48 |       
  49 |       expect(statuses).toContain(201);
  50 |       expect(statuses.includes(400) || statuses.includes(409)).toBe(true);
  51 |     });
  52 | 
  53 |     test("should handle concurrent duplicate registrations correctly", async ({ request }) => {
  54 |       const req1 = request.post("http://localhost:8787/api/v1/events/EVENT-DUP-001/register", {
  55 |         data: {
  56 |           turnstileToken: "1x0000000000000000000000000000000AA",
  57 |           fullName: "Test Duplicate",
  58 |           email: "duplicate@example.com",
  59 |           phone: "9876543210",
  60 |         },
  61 |       });
  62 |       
  63 |       const req2 = request.post("http://localhost:8787/api/v1/events/EVENT-DUP-001/register", {
  64 |         data: {
  65 |           turnstileToken: "1x0000000000000000000000000000000AA",
  66 |           fullName: "Test Duplicate",
  67 |           email: "duplicate@example.com",
  68 |           phone: "9876543210",
  69 |         },
  70 |       });
  71 | 
  72 |       const [res1, res2] = await Promise.all([req1, req2]);
  73 |       const statuses = [res1.status(), res2.status()];
  74 |       
  75 |       expect(statuses).toContain(201);
  76 |       // The second duplicate must be rejected (409 conflict or 429 if rate-limited)
  77 |       expect(statuses.some(s => s === 409 || s === 429)).toBe(true);
  78 |     });
  79 |   });
  80 | });
```
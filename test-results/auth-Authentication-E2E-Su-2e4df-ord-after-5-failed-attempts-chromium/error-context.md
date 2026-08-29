# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication E2E Suite >> Rate Limiting >> should rate-limit reset-password after 5 failed attempts
- Location: tests\e2e\auth.spec.ts:64:9

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:8787
Call log:
  - → POST http://localhost:8787/api/v1/auth/reset-password
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 65

```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authorization.spec.ts >> Authorization & IDOR Protection E2E Suite >> should enforce task modification IDOR restriction
- Location: tests\e2e\authorization.spec.ts:11:7

# Error details

```
Error: apiRequestContext.patch: connect ECONNREFUSED ::1:8787
Call log:
  - → PATCH http://localhost:8787/api/v1/tasks/TASK-2026-001
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 22

```
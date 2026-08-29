# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authorization.spec.ts >> Authorization & IDOR Protection E2E Suite >> should block unauthenticated API requests to protected endpoints
- Location: tests\e2e\authorization.spec.ts:4:7

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:8787
Call log:
  - → GET http://localhost:8787/api/v1/tasks
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```
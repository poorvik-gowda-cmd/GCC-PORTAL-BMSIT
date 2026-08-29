# GCC Portal — Architecture

## Overview

The GCC Portal is a unified monorepo containing:
1. **Public Website** — Next.js App Router, visible to all visitors
2. **Private Member Portal** — Next.js pages behind authenticated routes
3. **Backend API** — Cloudflare Workers (TypeScript) providing REST endpoints
4. **Shared Packages** — Contracts, auth helpers, RBAC, Google adapters

```
           Browser
              |
     ┌────────┴────────┐
     │   Cloudflare    │ (CDN, DDoS protection, Turnstile)
     └────────┬────────┘
              |
    ┌─────────┴──────────┐
    │    Next.js (web)   │  apps/web  (deployed: Cloudflare Pages)
    │  Public + Portal   │
    └─────────┬──────────┘
              | REST API calls (fetch)
    ┌─────────┴──────────┐
    │  Cloudflare Worker │  apps/api  (deployed: Cloudflare Workers)
    │   (TypeScript)     │
    └──┬──────────┬──────┘
       |          |
  ┌────┴───┐  ┌───┴──────────────────┐
  │ D1     │  │  Google APIs (HTTPS) │
  │(SQLite)│  │  - Sheets API v4     │
  │ Auth   │  │  - Drive API v3      │
  │ Users  │  └──────────────────────┘
  │ Roles  │
  │ Audit  │
  └────────┘
```

## Request Flow — Private Portal

1. Browser → GET `/portal/dashboard` (Next.js)
2. Next.js Server Component checks for session cookie
3. If no valid session → redirect to `/portal/login`
4. Portal page fetches data from `GET /api/v1/tasks` (Cloudflare Worker)
5. Worker middleware validates session token against D1 `sessions` table
6. Worker loads user roles + permissions from D1
7. Worker checks required permission(s) for the route
8. If authorized → fetches operational data from Google Sheets
9. Returns JSON response to Next.js
10. Next.js renders the portal page

## Request Flow — Public Event Registration

1. Browser → GET `/events/EVENT-2026-001` (Next.js)
2. Page fetches event details from `GET /api/v1/events/EVENT-2026-001` (D1 query)
3. User fills custom registration form + completes Turnstile challenge
4. Browser → POST `/api/v1/events/EVENT-2026-001/register`
5. Worker validates Turnstile token (Cloudflare Turnstile API)
6. Worker validates fields with Zod
7. Worker checks rate limit (by IP, D1 rate_limit_entries check)
8. Worker executes atomic D1 batch transaction (checks capacity constraint, UNIQUE email constraint, updates event count, generates registration ID sequence)
9. Worker triggers asynchronous, fire-and-forget sync to Google Sheets in the background
10. Worker returns `201 Created` with registration ID


## Package Dependency Graph

```
apps/web  ──────────────────────────────► packages/contracts
apps/web  ──────────────────────────────► packages/auth (client helpers)
apps/api  ──────────────────────────────► packages/contracts
apps/api  ──────────────────────────────► packages/auth (session management)
apps/api  ──────────────────────────────► packages/database
apps/api  ──────────────────────────────► packages/permissions
apps/api  ──────────────────────────────► packages/google-adapters
packages/permissions  ──────────────────► packages/contracts
packages/google-adapters  ──────────────► packages/contracts
```


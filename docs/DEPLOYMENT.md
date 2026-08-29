# GCC Portal — Deployment Guide

## Prerequisites

- Node.js >= 20.x
- Cloudflare account with Workers and D1 enabled
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare Pages project created
- Google Cloud project with Sheets API and Drive API enabled
- Google Service Account created with appropriate permissions

## Step 1: Clone and Install

```bash
git clone https://github.com/your-org/gcc-portal.git
cd gcc-portal
npm install
```

## Step 2: Create D1 Database

```bash
wrangler d1 create gcc-portal-db
# Copy the database_id output into apps/api/wrangler.toml
```

## Step 3: Run D1 Migrations

```bash
cd apps/api
wrangler d1 execute gcc-portal-db --file=../../packages/database/migrations/001_initial_schema.sql
wrangler d1 execute gcc-portal-db --file=../../packages/database/migrations/002_seed_roles.sql
wrangler d1 execute gcc-portal-db --file=../../packages/database/migrations/003_mfa_support.sql
wrangler d1 execute gcc-portal-db --file=../../packages/database/migrations/004_events_registrations_d1.sql
```

## Step 4: Set Worker Secrets

```bash
cd apps/api
wrangler secret put SESSION_SECRET
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
wrangler secret put GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
```

## Step 5: Configure wrangler.toml variables

Edit `apps/api/wrangler.toml` and fill in:
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- `ALLOWED_ORIGINS`

## Step 6: Deploy Worker

```bash
cd apps/api
wrangler deploy
# Note the deployed URL, e.g. https://gcc-api.username.workers.dev
```

## Step 7: Deploy Next.js to Cloudflare Pages

```bash
cd apps/web
# Set environment variables in Cloudflare Pages dashboard
# NEXT_PUBLIC_API_URL = https://gcc-api.username.workers.dev
# NEXT_PUBLIC_TURNSTILE_SITE_KEY = your_site_key
npm run build
wrangler pages deploy .next --project-name=gcc-portal-web
```

## Step 8: Seed First Admin User

```bash
cd apps/api
# Run the seed script to create the initial SYSTEM_SUPER_ADMIN
wrangler d1 execute gcc-portal-db --file=../../packages/database/seeds/admin_seed.sql
```
Change the admin password immediately after first login.

## Environments

| Environment | Worker URL | Pages URL |
|---|---|---|
| Development | `localhost:8787` | `localhost:3000` |
| Preview | Auto-generated preview URL | Preview branch URL |
| Production | `gcc-api.workers.dev` | `gcc-bmsitm.pages.dev` |

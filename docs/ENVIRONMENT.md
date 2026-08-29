# GCC Portal — Environment Variables Reference

## apps/api (Cloudflare Worker)

Set via `wrangler secret put <KEY>` for secrets in production.
Set in `wrangler.toml` [vars] section for non-secret config.

| Variable | Type | Required | Description |
|---|---|---|---|
| SESSION_SECRET | Secret | Yes | 64+ char random hex for session signing |
| TURNSTILE_SECRET_KEY | Secret | Yes | Cloudflare Turnstile secret |
| GOOGLE_SERVICE_ACCOUNT_EMAIL | Secret | Yes | GCP Service Account email |
| GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY | Secret | Yes | RSA private key (PEM) |
| GOOGLE_SHEETS_SPREADSHEET_ID | Var | Yes | Main operational spreadsheet ID |
| GOOGLE_DRIVE_ROOT_FOLDER_ID | Var | Yes | GCC root Drive folder ID |
| APP_ENV | Var | Yes | development / preview / production |
| ALLOWED_ORIGINS | Var | Yes | Comma-separated CORS origins |

D1 database binding set in wrangler.toml:
```toml
[[d1_databases]]
binding = "DB"
database_name = "gcc-portal-db"
database_id = "YOUR_D1_DATABASE_ID"
```

## apps/web (Next.js / Cloudflare Pages)

| Variable | Public | Required | Description |
|---|---|---|---|
| NEXT_PUBLIC_API_URL | Yes | Yes | Backend API base URL |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Yes | Yes | Turnstile site key (public) |
| NEXT_PUBLIC_APP_ENV | Yes | No | For conditional UI (dev/prod) |

## Cloudflare Turnstile Test Keys (Development Only)

Site key (always passes): `1x00000000000000000000AA`
Secret key (always passes): `1x0000000000000000000000000000000AA`

## Generating Secrets

```bash
# SESSION_SECRET
openssl rand -hex 64

# Or using Node.js
node -e "console.log(require(\"crypto\").randomBytes(64).toString(\"hex\"))"
```

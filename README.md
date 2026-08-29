# GCC Portal — Global Collaboration Cell, BMSIT&M

A unified monorepo containing the **Public GCC Website** and **Private GCC Member Portal**.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Cloudflare Workers (Hono framework), TypeScript |
| Auth DB | Cloudflare D1 (SQLite at edge) |
| Operational Data | Google Sheets API v4 |
| File Storage | Google Drive API v3 |
| Bot Protection | Cloudflare Turnstile |
| Validation | Zod |
| Testing | Vitest, Playwright |

## Project Structure

```
gcc-portal/
├── apps/
│   ├── web/          # Next.js public site + member portal
│   └── api/          # Cloudflare Workers REST API
├── packages/
│   ├── contracts/    # Shared TypeScript types + Zod schemas
│   ├── auth/         # Auth session helpers
│   ├── database/     # D1 row types + migrations
│   ├── permissions/  # RBAC logic
│   └── google-adapters/ # Google Sheets + Drive adapters
└── docs/             # Full architecture and security documentation
```

## Quick Start (Development)

```bash
# Clone and install
git clone https://github.com/your-org/gcc-portal.git
cd gcc-portal
npm install

# Copy and configure environment variables
cp .env.example apps/api/.dev.vars
# Edit .dev.vars with your local credentials

# Start API (Cloudflare Workers dev server)
npm run dev:api

# In another terminal, start the web app
npm run dev:web
```

## Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and request flows |
| [DB_SCHEMA.md](docs/DB_SCHEMA.md) | D1 database schema and indexes |
| [DATA_OWNERSHIP.md](docs/DATA_OWNERSHIP.md) | D1 vs Google Workspace responsibility split |
| [API_CONTRACT.md](docs/API_CONTRACT.md) | REST API reference |
| [AUTHORIZATION_MATRIX.md](docs/AUTHORIZATION_MATRIX.md) | RBAC roles and permissions |
| [SECURITY.md](docs/SECURITY.md) | Security controls and policies |
| [ENVIRONMENT.md](docs/ENVIRONMENT.md) | Required environment variables |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Step-by-step Cloudflare deployment guide |

## Key Security Notes

- **No public signup.** Members are created by administrators only.
- **Roles are server-side only.** Users cannot set their own role or department.
- **Passwords hashed** with PBKDF2-HMAC-SHA256 (310,000 iterations).
- **Sessions** are stored in D1 with HttpOnly, Secure, SameSite=Lax cookies.
- **All secrets** in Cloudflare Worker secrets — never in source code.

## License

Internal project — Global Collaboration Cell, BMSIT&M. All rights reserved.

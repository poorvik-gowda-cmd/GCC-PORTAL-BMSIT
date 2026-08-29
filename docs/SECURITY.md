# GCC Portal — Security Policy

## Defense in Depth Layers

### Layer 1: Cloudflare Edge
- HTTPS enforced globally (TLS 1.2+ minimum)
- Cloudflare DDoS protection active
- Cloudflare Turnstile on all public forms (bot mitigation)
- Cloudflare WAF for common attack patterns

### Layer 2: Application Transport
- All cookies: HttpOnly, Secure (in production), SameSite=Lax
- Session tokens: cryptographically random 32-byte tokens (64 hex chars)
- Session token storage: hashed using SHA-256 before storing in D1 to prevent hijack via DB leak
- CSRF Protection: double-submit CSRF protection on all state-changing authenticated endpoints using `X-CSRF-Token` header validation

### Layer 3: Authentication & Bot Guard
- Passwords: PBKDF2-HMAC-SHA256, 310,000 iterations, random salt (32 bytes)
- No password in logs, API responses, or error messages
- Rate limiting: 5 failed login attempts per IP per 15 minutes; 10 registration submissions per IP per 5 minutes
- Bot Protection: Cloudflare Turnstile bot verification enforced on event registrations
- Account lockout notification in audit_logs as BRUTE_FORCE_ATTEMPT
- Password reset: token valid 15 minutes, single use, stored as SHA-256 hash


### Layer 4: Authorization (see AUTHORIZATION_MATRIX.md)
- All protected routes check: session validity → account status → permissions
- Department isolation enforced on every query
- Resource ownership (IDOR) verified per-request

### Layer 5: Input Validation
- Zod schemas on all API endpoints (shared from packages/contracts)
- Request body size limits applied
- SQL: parameterized statements exclusively
- Output: JSON.stringify with no template-literal injection risk

### Layer 6: Headers
- Content-Security-Policy configured for Next.js pages
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restricts camera/mic/geolocation

### Layer 7: Secrets Management
- All secrets in Cloudflare Worker secrets (wrangler secret put)
- Next.js secrets in Cloudflare Pages environment variables
- Zero secrets in source code or .env committed files

## What We Never Do
- Store plaintext passwords
- Trust user-supplied role/department claims
- Use URL parameters for authorization decisions
- Expose stack traces to clients
- Log tokens, passwords, or private keys
- Use eval() or dynamic code
- Build SQL from string concatenation

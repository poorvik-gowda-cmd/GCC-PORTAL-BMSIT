# GCC Portal — API Contract

## Base URL
- Development: `http://localhost:8787/api/v1`
- Production: `https://api.gcc-bmsitm.workers.dev/api/v1`

## Response Format

All responses follow this envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "PERMISSION_DENIED", "message": "..." } }
```

## Error Codes
| Code | HTTP Status | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Zod schema validation failed |
| UNAUTHORIZED | 401 | No valid session |
| FORBIDDEN | 403 | Authenticated but lacks permission |
| NOT_FOUND | 404 | Resource not found |
| DUPLICATE | 409 | Duplicate registration/record |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error (no details exposed) |

## Auth Endpoints

### POST /api/v1/auth/login
Request: `{ email: string, password: string }`
Response: Sets HttpOnly session cookie. Returns `{ user: UserProfile }`

### POST /api/v1/auth/logout
Response: Clears session cookie. Returns `{ success: true }`

### GET /api/v1/auth/me
Response: `{ user: UserProfile, roles: string[], departments: string[], permissions: string[] }`

### POST /api/v1/auth/forgot-password
Request: `{ email: string }`
Response: Always returns 200 (prevents email enumeration)

### POST /api/v1/auth/reset-password
Request: `{ token: string, newPassword: string }`

## Task Endpoints

### GET /api/v1/tasks
Auth: Required. Scoped by role (global or department).
Query: `?department=MARKETING&status=IN_PROGRESS&priority=HIGH`
Response: `{ tasks: Task[] }`

### POST /api/v1/tasks
Auth: Required + TASK_ASSIGN_GLOBAL or TASK_ASSIGN_DEPARTMENT
Request: `TaskCreateRequest`

### GET /api/v1/tasks/:id
Auth: Required. Department scoping applied.

### PATCH /api/v1/tasks/:id
Auth: Required. Only assigned user or EC can update.

### POST /api/v1/tasks/:id/remarks
Auth: Required + TASK_REMARK

## Event Endpoints

### GET /api/v1/events
Public. Returns only PUBLISHED events.
Query: `?category=...&upcoming=true`

### POST /api/v1/events
Auth: Required + EVENT_CREATE

### GET /api/v1/events/:id
Public (if published). Authenticated users see draft events if authorized.

### PATCH /api/v1/events/:id
Auth: Required + EVENT_EDIT

### POST /api/v1/events/:id/publish
Auth: Required + EVENT_PUBLISH

### POST /api/v1/events/:id/register
Public. Requires Turnstile token.
Request: `{ turnstileToken: string, fullName: string, email: string, ... custom fields }`
Response: `{ registrationId: string }`

### GET /api/v1/events/:id/registrations
Auth: Required + REGISTRATION_VIEW

## Resource Endpoints

### GET /api/v1/resources/stream
Auth: Required + RESOURCE_VIEW_DEPARTMENT
Query: `?fileId=DRIVE_FILE_ID`
Response: Streams file content from Google Drive

### GET /api/v1/mou
Auth: Required + MOU_VIEW

### GET /api/v1/research
Auth: Required + RESEARCH_VIEW

### POST /api/v1/research/upload
Auth: Required + RESEARCH_UPLOAD

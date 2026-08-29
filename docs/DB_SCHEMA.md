# GCC Portal — D1 Database Schema

## Design Principles

- D1 is the **single source of truth** for identity, security, and authorization.
- All queries use **parameterized statements** only. No string concatenation of user input.
- UUIDs used as primary keys (generated application-side with `crypto.randomUUID()`).
- Unix timestamps (INTEGER) used for all date/time fields for portability.
- `ON DELETE CASCADE` on foreign keys to maintain referential integrity.

## Tables

### `departments`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | TEXT | PK | e.g. EXECUTION_COUNCIL |
| name | TEXT | NOT NULL | Display name |
| description | TEXT | | |

### `roles`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | TEXT | PK | e.g. EXECUTIVE_COUNCIL |
| name | TEXT | NOT NULL | Display name |

### `permissions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | TEXT | PK | e.g. TASK_ASSIGN_GLOBAL |
| description | TEXT | | Human-readable description |

### `users`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | TEXT | PK | UUID |
| email | TEXT | UNIQUE, NOT NULL | Indexed |
| full_name | TEXT | NOT NULL | |
| password_hash | TEXT | NOT NULL | PBKDF2-HMAC-SHA256 format |
| account_status | TEXT | NOT NULL | ACTIVE / SUSPENDED / REVOKED / PENDING_PASSWORD_SETUP |
| profile_photo_reference | TEXT | NULL | Drive file ID or URL |
| created_at | INTEGER | NOT NULL | Unix timestamp |
| updated_at | INTEGER | NOT NULL | Unix timestamp |
| last_login_at | INTEGER | NULL | Unix timestamp |

### `user_roles`
| Column | Type | Constraints |
|---|---|---|
| user_id | TEXT | FK users.id ON DELETE CASCADE |
| role_id | TEXT | FK roles.id ON DELETE CASCADE |
| PRIMARY KEY | (user_id, role_id) | |

### `user_departments`
| Column | Type | Constraints |
|---|---|---|
| user_id | TEXT | FK users.id ON DELETE CASCADE |
| department_id | TEXT | FK departments.id ON DELETE CASCADE |
| PRIMARY KEY | (user_id, department_id) | |

### `role_permissions`
| Column | Type | Constraints |
|---|---|---|
| role_id | TEXT | FK roles.id ON DELETE CASCADE |
| permission_id | TEXT | FK permissions.id ON DELETE CASCADE |
| PRIMARY KEY | (role_id, permission_id) | |

### `sessions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | TEXT | PK | Cryptographically random (64 hex chars) |
| user_id | TEXT | FK users.id ON DELETE CASCADE, Indexed | |
| expires_at | INTEGER | NOT NULL | Unix timestamp |
| created_at | INTEGER | NOT NULL | Unix timestamp |
| ip_address | TEXT | NULL | |
| user_agent | TEXT | NULL | |

### `password_reset_tokens`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| token_hash | TEXT | PK | SHA-256 of the actual token |
| user_id | TEXT | FK users.id ON DELETE CASCADE | |
| expires_at | INTEGER | NOT NULL | Unix timestamp (15 min TTL) |
| used_at | INTEGER | NULL | |

### `audit_logs`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | TEXT | PK | UUID |
| timestamp | INTEGER | NOT NULL | Indexed |
| user_id | TEXT | NULL | SET NULL on user delete |
| action | TEXT | NOT NULL | Indexed — see action catalog below |
| details | TEXT | | JSON string (NO passwords/tokens) |
| ip_address | TEXT | NULL | |
| user_agent | TEXT | NULL | |

**Audit Action Catalog:** `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `ROLE_CHANGED`, `DEPARTMENT_CHANGED`, `PASSWORD_RESET`, `TASK_ASSIGNED`, `TASK_UPDATED`, `TASK_COMPLETED`, `EVENT_CREATED`, `EVENT_PUBLISHED`, `REGISTRATION_SUBMITTED`, `MOU_ACCESSED`, `RESEARCH_UPLOADED`, `PERMISSION_DENIED`, `ADMIN_ACTION`, `SESSION_EXPIRED`

### `security_events`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | TEXT | PK | UUID |
| timestamp | INTEGER | NOT NULL | |
| event_type | TEXT | NOT NULL | e.g. RATE_LIMIT_EXCEEDED, BRUTE_FORCE_ATTEMPT |
| ip_address | TEXT | NULL | |
| user_agent | TEXT | NULL | |
| details | TEXT | | JSON string |

## Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

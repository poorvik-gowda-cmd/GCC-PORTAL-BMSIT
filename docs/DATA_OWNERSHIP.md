# GCC Portal — Data Ownership

## Source of Truth Mapping

| Data | System | Rationale |
|---|---|---|
| Users (identity) | Cloudflare D1 | Security-critical; must be controlled |
| Password hashes | Cloudflare D1 | Security-critical |
| Account status | Cloudflare D1 | Auth gating |
| Roles | Cloudflare D1 | Authorization |
| Departments | Cloudflare D1 | Authorization |
| Permissions | Cloudflare D1 | Authorization |
| Sessions | Cloudflare D1 | Auth state |
| Audit logs | Cloudflare D1 | Security record |
| Security events | Cloudflare D1 | Security record |
| Tasks | Google Sheets | Operational / collaborative |
| Events | Cloudflare D1 | Primary transaction data; sync to Sheets |
| Event Registrations | Cloudflare D1 | Primary transaction data; sync to Sheets |
| Attendance | Google Sheets | Operational |
| Feedback | Google Sheets | Operational |
| Opportunities | Google Sheets | Operational |
| MOU metadata | Google Sheets | Operational metadata |
| Research metadata | Google Sheets | Operational metadata |
| QR Registry | Google Sheets | Operational |
| MOU documents | Google Drive | File storage |
| Research documents | Google Drive | File storage |
| Design assets | Google Drive | File storage |
| Media/Photos | Google Drive | File storage |
| Club documents | Google Drive | File storage |

## Rules

1. D1 is NEVER used for operational task/event data.
2. Google Sheets is NEVER used for passwords, sessions, or roles.
3. The frontend NEVER directly calls Google APIs.
4. All Google API calls are proxied through the Cloudflare Worker.
5. Private Drive files are accessed via Worker proxy only, never via public share links.
6. No data is duplicated across D1 and Sheets unless for temporary caching with clear TTL.

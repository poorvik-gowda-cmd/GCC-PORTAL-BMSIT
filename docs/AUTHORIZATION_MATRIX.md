# GCC Portal — Authorization Matrix

## Roles

| Role ID | Description |
|---|---|
| SYSTEM_SUPER_ADMIN | Full system access |
| EXECUTIVE_COUNCIL | Cross-department leadership |
| DEPARTMENT_LEAD | Manages own department |
| DEPARTMENT_MEMBER | Member of one department |

## Departments

| Department ID | Name |
|---|---|
| EXECUTION_COUNCIL | Execution Council |
| RESEARCH_PUBLICATION | Research & Publication |
| MARKETING | Marketing |
| DIGITAL_SYSTEMS | Digital Systems |
| DESIGN_CREATIVE | Design & Creative |
| PHOTOGRAPHY_MEDIA | Photography & Media |

## Permission Registry

| Permission ID | Description |
|---|---|
| TASK_ASSIGN_GLOBAL | Assign tasks to any member/department |
| TASK_ASSIGN_DEPARTMENT | Assign tasks within own department |
| TASK_VIEW_GLOBAL | View tasks across all departments |
| TASK_VIEW_DEPARTMENT | View tasks within own department |
| TASK_UPDATE_OWN | Update status of own assigned task |
| TASK_REMARK | Add remarks to tasks (lead/EC) |
| EVENT_CREATE | Create new events |
| EVENT_EDIT | Edit existing events |
| EVENT_PUBLISH | Publish/unpublish events |
| REGISTRATION_VIEW | View event registrations |
| REGISTRATION_EXPORT | Export registration data |
| ATTENDANCE_MANAGE | Mark and manage attendance |
| FEEDBACK_VIEW | View feedback submissions |
| MOU_VIEW | View MOU records and metadata |
| MOU_EDIT | Edit MOU records |
| RESEARCH_UPLOAD | Upload research documents |
| RESEARCH_VIEW | View research records |
| RESOURCE_VIEW_DEPARTMENT | View own department resources |
| QR_GENERATE | Generate QR codes for events |
| USER_MANAGE | Create/edit/suspend users |
| ROLE_MANAGE | Assign/revoke roles |
| AUDIT_VIEW | View audit logs |
| ADMIN_ACTION | Perform admin-level operations |

## Role → Permission Mapping

### SYSTEM_SUPER_ADMIN
All permissions.

### EXECUTIVE_COUNCIL
- TASK_ASSIGN_GLOBAL
- TASK_VIEW_GLOBAL
- TASK_REMARK
- EVENT_CREATE, EVENT_EDIT, EVENT_PUBLISH
- REGISTRATION_VIEW, REGISTRATION_EXPORT
- ATTENDANCE_MANAGE
- FEEDBACK_VIEW
- MOU_VIEW, MOU_EDIT
- RESEARCH_VIEW
- RESOURCE_VIEW_DEPARTMENT
- QR_GENERATE
- AUDIT_VIEW

### DEPARTMENT_LEAD
- TASK_ASSIGN_DEPARTMENT
- TASK_VIEW_DEPARTMENT
- TASK_UPDATE_OWN
- TASK_REMARK
- RESEARCH_UPLOAD (own dept)
- RESEARCH_VIEW (own dept)
- MOU_VIEW (if EC grants)
- RESOURCE_VIEW_DEPARTMENT
- REGISTRATION_VIEW (events own dept manages)
- ATTENDANCE_MANAGE (own dept events)

### DEPARTMENT_MEMBER
- TASK_VIEW_DEPARTMENT
- TASK_UPDATE_OWN
- RESEARCH_VIEW (own dept)
- RESOURCE_VIEW_DEPARTMENT

## Authorization Enforcement Rules

1. **Backend enforces ALL rules.** Frontend navigation is a convenience layer only.
2. For any task mutation, backend checks: `tasks.assigned_to == current_user.id`.
3. For any department resource access, backend checks: `current_user.departments CONTAINS resource.department_id`.
4. For global operations (EXECUTIVE_COUNCIL), no department restriction applies.
5. SUSPENDED and REVOKED accounts receive `403 Forbidden` on all protected routes.
6. All `403` responses are recorded in `audit_logs` as `PERMISSION_DENIED`.

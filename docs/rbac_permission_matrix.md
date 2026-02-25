# RBAC & Permission Matrix [V20260218_0000]

This document defines the Role-Based Access Control (RBAC) model for the `bizPA` application, specifically for the **Team Plugin**. It ensures separation of duties between business owners (Master) and field staff/admins (Slave).

## 1. Role Definitions

| Role | Code | Description | Typical User |
| :--- | :--- | :--- | :--- |
| **Owner (Master)** | `OWNER` | Full access to all data, settings, billing, and team management. Can export financial data. | Sole Trader / Director |
| **Office Admin** | `ADMIN` | Can manage jobs, clients, and revenue follow-ups. Cannot manage team, billing, or export full tax packs. | Partner / Assistant |
| **Field Staff** | `FIELD` | Limited access. Can only capture new items and view jobs assigned to them. No financial overview access. | Employee / Sub-contractor |

## 2. Permission Scopes (API Mapping)

The following matrix maps the API Scopes defined in Workstream 2 to the Roles defined above.

| Scope | Description | `OWNER` | `ADMIN` | `FIELD` |
| :--- | :--- | :---: | :---: | :---: |
| **Core** | | | | |
| `auth:login` | Login to app | ✅ | ✅ | ✅ |
| `user:read` | Read own profile | ✅ | ✅ | ✅ |
| `item:read` | Read capture items | ✅ | ✅ (All) | ⚠️ (Assigned Only) |
| `item:write` | Create/Edit items | ✅ | ✅ | ✅ (Create Only) |
| `client:read` | Read client list | ✅ | ✅ | ⚠️ (Assigned Only) |
| `client:write` | Create/Edit clients | ✅ | ✅ | ❌ |
| `job:read` | Read job list | ✅ | ✅ | ⚠️ (Assigned Only) |
| `job:write` | Update job status | ✅ | ✅ | ✅ (Status Only) |
| **Revenue Engine** | | | | |
| `revenue:read` | View overdue/follow-ups | ✅ | ✅ | ❌ |
| `revenue:write` | Send outreach messages | ✅ | ✅ | ❌ |
| **Export & Finance** | | | | |
| `export:generate` | Generate tax/CSV packs | ✅ | ❌ | ❌ |
| `export:read` | Download exports | ✅ | ❌ | ❌ |
| **Team Management** | | | | |
| `team:read` | View team members | ✅ | ✅ | ❌ |
| `team:write` | Invite/Remove members | ✅ | ❌ | ❌ |
| `assignment:write`| Assign jobs/items | ✅ | ✅ | ❌ |

## 3. Field-Level Restrictions

For `FIELD` role users, data visibility is restricted at the row level even if they have `item:read` access.

| Entity | Restriction Logic |
| :--- | :--- |
| **Capture Items** | Can only see items where `created_by_user_id == current_user.id` OR `assigned_to_user_id == current_user.id`. |
| **Jobs** | Can only see jobs linked in `assignment_links` table for their `user_id`. |
| **Clients** | Can only see clients associated with their assigned jobs. |
| **Financials** | `amount`, `vat_amount`, and `revenue_total` fields are **masked** or `null` in API responses for `FIELD` users unless explicitly allowed by `OWNER`. |

## 4. Voice Command Permissions

Voice intents must check permissions before execution.

| Intent | Required Scope | Failure Response (TTS) |
| :--- | :--- | :--- |
| `export_range` | `export:generate` | "Sorry, only the business owner can export data." |
| `send_message` | `revenue:write` | "You don't have permission to send client messages." |
| `show_followups`| `revenue:read` | "Access denied to revenue dashboard." |
| `assign_job` | `assignment:write`| "You cannot assign jobs." |

## 5. Audit Logging

All actions by `ADMIN` and `FIELD` roles are logged in `audit_events` with the `user_id` and `device_id`. The `OWNER` can review this audit log to see:
- Who captured an item.
- Who modified a job status.
- Who sent a client message.

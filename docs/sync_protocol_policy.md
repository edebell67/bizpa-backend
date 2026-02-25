# Sync Protocol & Conflict Resolution Policy [V20260217_2345]

## 1. Sync Philosophy
- **Offline-First**: The mobile app is the source of truth for local capture.
- **Delta-Sync**: Only changes (deltas) are transmitted to minimize bandwidth.
- **Append-Only Journal**: Changes are captured as an immutable sequence of events.

## 2. Protocol Flow
### A. Client-to-Server (Push)
1. Client collects all local `audit_events` created since the last sync.
2. Client sends a batch of events to `/api/v1/sync/push`.
3. Server validates events, applies them to the master database, and returns a confirmation with a new `sync_token`.

### B. Server-to-Client (Pull)
1. Client sends its current `sync_token` to `/api/v1/sync/delta`.
2. Server queries all events created by other devices (or the server itself) after that token.
3. Server returns a list of delta events.
4. Client applies these events to the local SQLite database.

## 3. Conflict Resolution Policy
Due to the nature of small trader workflows (usually single-owner), complex merging is avoided in favor of speed and predictability.

### Policy: Last-Write-Wins (LWW)
- The event with the **latest `timestamp`** (device-reported) wins.
- **Exception**: If a record is `deleted` on the server, subsequent updates from a client are ignored unless they explicitly "undelete" it.

### Data Integrity
- **Idempotency**: All sync events must include an `event_id` (UUID). The server/client must ignore duplicate events with the same ID.
- **Audit Log**: Every conflict resolution is logged in the `audit_events` table for potential manual recovery.
- **Soft Deletes**: Records are never physically deleted; they are marked with a `status = 'archived'` or `is_deleted = true` flag to ensure the sync journal remains consistent.

## 4. Conflict Scenarios
| Scenario | Resolution |
| :--- | :--- |
| **Concurrent Edit** | Latest `timestamp` wins. The entire record is overwritten by the winner's snapshot. |
| **Edit vs. Delete** | Delete wins unless the Edit timestamp is significantly later (>1 hour gap, indicating intentional re-creation). |
| **Duplicate IDs** | Ignored by the receiving end (Idempotency check). |
| **FK Violation** | The dependent record is held in a `pending` state until the parent record is successfully synced. |

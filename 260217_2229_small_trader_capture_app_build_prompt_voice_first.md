# Implementation Plan: Voice-First Small Trader Capture App (MVP + Revenue Engine)

## Source
- Prompt: `small_trader_capture_app_build_prompt_voice_first.md`
- Focus: Offline-first, voice-first, UK small traders, capture + revenue workflows

## 1. Scope and Success Criteria
## 0. Product Packaging Model (Core + Plugins)
### Core MVP Principle
- Ship a lean base app with mandatory capture/retrieval/security only.
- All major advanced capabilities are modular plugins enabled only on request.

### Plugin Runtime Model
- `enabled_modules` registry in config/user subscription.
- Module lifecycle: `installed -> enabled -> configured`.
- Each module can contribute:
  - screens/routes
  - voice intents
  - DB migrations/tables
  - permissions and policy checks
  - background jobs
- If module disabled, related UI/actions/intents are hidden and blocked server-side.

### Initial Module Catalog
- `core_capture` (always on)
- `voice_core` (always on)
- `calendar_plugin` (optional)
- `diary_plugin` (optional)
- `revenue_engine_plugin` (optional)
- `team_plugin` (optional; master-slave features)
- `export_plus_plugin` (optional)
- `sync_cloud_plugin` (optional)
- `voice_advanced_plugin` (optional; hands-free/wake phrase)

## 1. Scope and Success Criteria
### Objectives
- Deliver a shippable MVP that enables hands-free capture and retrieval in under 5 seconds per core action.
- Ensure all key workflows support voice command, minimal clarifications, and optional TTS confirmations.
- Build revenue engine primitives: unpaid chasing, re-service reminders, reactivation, referral prompts.

### Base MVP In-Scope (Core Only)
- Push-to-talk voice command overlay and voice dictation.
- Unified `CaptureItem` object with timestamp + label enforcement.
- Core objects: CaptureItem, Client (minimal), Job (minimal).
- Offline-first local storage and queue for OCR/transcription.
- Search + filters + basic export.
- Undo last action.
- Base security/auth controls.

### Plugin Features (Enabled On Request)
- Calendar scheduling and reminders.
- Diary/journal and linked notes.
- Revenue engine (unpaid chase, reactivation, referral, follow-up rules).
- Team functionality with owner-controlled delegation (master-slave model).
- Advanced exports (accountant pack variants, scheduled exports).
- Cloud sync and multi-device.
- Advanced voice (hands-free/wake phrase).

### MVP Out-of-Scope
- Bank feed reconciliation.
- Tax submission automation.
- Wake phrase (phase 2 unless capacity allows optional prototype).

## 2. Architecture Plan
### Mobile App Stack
- Framework: Flutter or React Native (recommend Flutter for consistent offline media/voice handling).
- Local DB: SQLite + FTS index for `extracted_text`, `raw_note`, labels.
- Local file store: attachment registry + encrypted file paths.
- Background queue: durable job table for OCR/transcription/sync retries.

### Voice Stack
- ASR: on-device first where available, cloud fallback.
- NLU: hybrid rule-first intent parser + entity extraction (amount/date/client/label/status).
- Dialogue manager: one-question clarification rule.
- TTS: short confirmations; sensitive-read policy enforcement.

### Sync/API (optional in MVP)
- Local-first with deferred sync API contract prepared.
- Conflict policy: last-write-wins + append-only audit events.

## 3. Data Model and Storage Tasks
### Core Tables
- `capture_items`
- `capture_item_labels`
- `capture_item_attachments`
- `clients`
- `jobs`
- `voice_events` (intent transcript, confidence, action result)
- `job_queue` (ocr/transcription/sync)
- `audit_events`

### Plugin-Owned Tables (created only when module enabled)
- `calendar_plugin`: `calendar_events`
- `diary_plugin`: `diary_entries`
- `revenue_engine_plugin`: `outreach_logs`, `trigger_rules`, `message_templates`
- `team_plugin`: `teams`, `team_members`, `role_permissions`, `assignment_links`
- `sync_cloud_plugin`: `sync_devices`

### Required Indexes
- `capture_items(created_at)`
- `capture_items(type, status)`
- `capture_items(client_id, job_id)`
- `capture_items(assigned_to_user_id, created_by_user_id)`
- FTS virtual table on `extracted_text`, `raw_note`, client/job names, labels
- `jobs(next_due_date, status)`
- `calendar_events(start_at, end_at, status)`
- `diary_entries(entry_date, created_at)`
- `outreach_logs(follow_up_due_at, outcome)`
- `team_members(team_id, user_id, role)`

## 4. Voice Intent Implementation Plan
### Priority Intents (MVP)
1. `capture_receipt`
2. `capture_invoice`
3. `capture_payment`
4. `capture_photo`
5. `create_note`
6. `start_voice_memo` / `stop_voice_memo`
7. `search_items`
8. `export_range`
9. `summarise_today`
10. `undo_last_action`

### Plugin Intents (enabled by module)
- `calendar_plugin`: `create_calendar_event`, `show_calendar`
- `diary_plugin`: `create_diary_entry`, `show_diary`
- `revenue_engine_plugin`: `show_followups`, `send_message`, `mark_paid`
- `team_plugin`: `assign_item`, `assign_job`, `switch_workspace`

### Intent Engine Rules
- Confidence thresholds:
  - `>=0.80`: execute + confirm
  - `0.55-0.79`: ask one clarification
  - `<0.55`: save as draft or ask to retry
- Missing required slots: ask one question max, provide 2-3 options, allow `skip`.
- Safety: suppress sensitive TTS by default; require explicit user request to read details.

## 5. UX and Screen Delivery Plan
### Required Screens
1. Home (Capture + big mic + voice reply toggle)
2. Inbox/Timeline (filters + voice filter shortcuts)
3. Voice Command Overlay (recognized text + action + Confirm/Edit/Cancel + Undo)
4. Capture flows (receipt/invoice/payment/photo/note/voice)
5. Export flow (voice-triggered share options)

### Plugin Screens (loaded on demand)
- `revenue_engine_plugin`: Follow-ups dashboard
- `calendar_plugin`: Calendar (day/week view + reminders + job schedule)
- `diary_plugin`: Diary (daily log, linked to client/job/items)
- `team_plugin`: Team & Permissions (owner controls, invites, role setup, assignments)

### Team Model (Master-Slave)
- `Master` (Owner/Admin): full permissions, config, exports, billing, team policy.
- `Slave` (Field Member): capture, assigned jobs/events, limited client visibility as configured.
- Optional `Office Manager`: follow-up/outreach + scheduling, no billing config.
- All write actions stamped with `created_by`, `last_updated_by`, `device_id`.
- Owner can lock sensitive actions (export/delete/send bulk messages).

### UX Constraints
- Voice-only operable paths for primary workflows.
- Default short confirmations.
- Always available commands: cancel, stop, undo, repeat.

## 6. Revenue Engine Plan
Status: Plugin (`revenue_engine_plugin`)
### Rule Engine (MVP)
- Trigger categories:
  - unpaid invoice due
  - time since last job
  - inactive client windows (6/12/18 months)
  - post-job referral prompt
- Action outputs:
  - create follow-up task
  - suggest message template

### Outreach Workflow
- Queue top follow-ups daily.
- One-tap/voice send with explicit confirmation.
- Log outcome and next follow-up date.
- Support owner-approved outbound messaging for field users (approval queue optional).

## 7. Milestones (2-3 MVP phases)
### Milestone 1: Capture + Voice Core (2 weeks)
- Local DB schema + item capture primitives
- Push-to-talk ASR + intent parser for capture/note/payment
- Voice overlay + TTS short confirmations
- Offline queue scaffolding
- Undo last action
- Plugin framework: module registry + runtime enable/disable + guarded routes/intents

### Milestone 2: Retrieval + Follow-up Engine (2 weeks)
- Timeline/search with FTS
- Client/job linking and unpaid invoices view
- Export CSV + evidence pack
- First plugin rollout pack:
  - `calendar_plugin`
  - `diary_plugin`

### Milestone 3: Hardening + Beta Readiness (1-2 weeks)
- Offline/online sync hardening
- Security controls (PIN/biometric, encryption-at-rest)
- Accuracy tuning for intents/slots
- Telemetry dashboards (intent success, correction rate, latency)
- UAT with test scripts against acceptance criteria
- Second plugin rollout pack:
  - `revenue_engine_plugin`
  - `team_plugin`
  - `export_plus_plugin`
- Calendar reminder reliability checks and diary search performance tuning

## 8. Testing and Acceptance Plan
### Functional Tests
- Voice command execution for each priority intent.
- Clarification behavior (single-question limit).
- Undo consistency across item create/update/link/send actions.
- Calendar event create/edit/cancel via voice and UI.
- Diary create/search/link-to-client-or-job behavior.

### Offline Tests
- Capture with no signal creates valid items and queues processing.
- Delayed transcript/OCR reconciliation updates items correctly.

### Performance Tests
- Voice-to-action under 5s on mid-tier device (P50/P90 tracked).

### Safety/Privacy Tests
- Sensitive details not spoken unless explicitly requested.
- Private mode disables sensitive TTS.

## 9. Risks and Mitigations
- Noisy environments/accents: add quick retry, confidence thresholds, user correction chips.
- Mis-execution risk: mandatory confirmation for sending/outreach and financial actions.
- Offline backlog growth: queue prioritization + retry backoff + storage caps.
- GDPR/privacy: consent fields, no third-party lead extraction, transparent data controls.
- Role misuse/data leakage: strict permission checks server-side + audit logs + owner alerts.

## 10. Delivery Artifacts Checklist
- Voice-first PRD
- Data model with migrations/indexes
- Intent/slot spec + confidence policy
- API outline (sync-ready)
- UX flow specs with voice dialogues
- MVP milestone plan
- Risk register and mitigations
- UK message templates + short spoken variants
- Role-permission matrix and team workflow SOP (master-slave model)

## 12. Plugin Governance Rules
- Every plugin must declare:
  - required permissions
  - DB migrations (up/down)
  - intents added
  - screens/routes added
  - background jobs added
- Core must enforce hard blocks when plugin disabled (UI + API + job runner).
- Uninstall path must preserve data safety (archive or soft-disable, no silent data loss).

## 11. Immediate Next Build Steps
1. Finalize mobile stack selection and ASR provider choice.
2. Implement schema and queue foundation.
3. Build voice overlay and 3 core intents (`capture_receipt`, `capture_payment`, `create_note`).
4. Validate latency and correction rate with a small device test cohort.

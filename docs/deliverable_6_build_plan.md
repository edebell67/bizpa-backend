# Deliverable 6: MVP Build Plan [V20260218_0015]

## Milestone 1: Core Capture & Voice (Weeks 1-2)

- [x] **Implementation 1.1**: Backend Scaffolding (Node.js/Express) + DB Foundation - **Complete**

- [x] **Implementation 1.2**: API Schema & Models (WS2: `capture_items`, `clients`) - **Complete**

- [x] **Implementation 1.3**: Voice Processing API (ASR/NLU Integration) - **Complete**

- [x] **Implementation 1.4**: Core Capture Logic (Item CRUD + Validation) - **Complete**

- [x] **Implementation 1.5**: Undo and Confirmation Logic - **Complete**



## Milestone 2: Search & Retrieval (Weeks 3-4)

- [>] **Implementation 2.1**: FTS5 Search Indexing and Querying - **In Progress**


- [ ] **Implementation 2.2**: Timeline/Inbox UI with Voice Filters.
- [ ] **Implementation 2.3**: Client & Job Management (Basic CRM).
- [ ] **Implementation 2.4**: Basic CSV Export (Offline first).

## Milestone 3: Plugin Rollout & Hardening (Weeks 5-6)
- [ ] **Plugin 3.1**: Revenue Engine (Payment Chase, Re-Service).
- [ ] **Plugin 3.2**: Calendar and Diary.
- [ ] **Plugin 3.3**: Sync Cloud and Team (Master-Slave RBAC).
- [ ] **Hardening**: Latency tuning, ASR accuracy review, Beta UAT.

## Technical Stack Selection
- **Mobile**: Flutter (for reliable offline media and SQLite storage).
- **Local DB**: SQLite + SQLCipher for encryption.
- **ASR/NLU**: OpenAI Whisper (Cloud fallback) + On-device ASR (iOS/Android native).
- **Backend**: Node.js/Express (Matches existing project tech).

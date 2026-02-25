# Deliverable 1: PRD (Voice-First) [V20260218_0015]

## 1. Product Summary
A UK-first, offline-first, voice-first mobile app for small traders to capture work evidence and admin data in seconds, then retrieve and act on it quickly.

## 2. Target Users
- Sole traders and small field teams.
- Users operating hands-busy (on-site, driving breaks, gloves).

## 3. Goals (MVP)
- Voice-to-action under 5 seconds for primary commands.
- Reliable offline capture with deferred OCR/transcription.
- Fast retrieval and basic export.
- Plugin-ready architecture (advanced features enabled on request).

## 4. Success Metrics (KPIs)
- **Latency**: P50 voice-to-action <= 3s, P90 <= 5s.
- **Accuracy**: Core intent correction rate <= 10%.
- **Reliability**: Crash-free sessions >= 99.5%.

## 5. Scope Split
- **Core**: Capture (Receipt/Invoice/Payment/Photo/Note/Voice), Timeline, Search, Undo, Basic Export, Security.
- **Plugins**: Calendar, Diary, Revenue Engine, Team (Master-Slave), Advanced Export, Sync, Advanced Voice.

## 6. Security & Privacy
- Biometric/PIN lock.
- Encryption at rest (SQLCipher) and TLS in transit.
- Mandatory consent checks for outreach.

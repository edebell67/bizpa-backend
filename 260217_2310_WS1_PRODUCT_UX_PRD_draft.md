# WS1 PRD Final: Voice-First Small Trader Capture App

## 1. Product Summary
A UK-first, offline-first, voice-first mobile app for small traders to capture work evidence and admin data in seconds, then retrieve and act on it quickly.

## 2. Target Users
- Sole traders and small field teams
- Users operating hands-busy (on-site, driving breaks, gloves)

## 3. Problem Statement
Traders lose billable time and miss follow-ups because capture/admin tools are slow, typing-heavy, and fragmented.

## 4. Goals (MVP)
- Voice-to-action under 5 seconds for primary commands.
- Reliable offline capture with deferred OCR/transcription.
- Fast retrieval and basic export.
- Plugin-ready architecture (advanced features enabled on request).

## 5. Non-Goals (MVP)
- Bank feeds
- Tax submission automation
- Third-party lead scraping

## 6. Scope
### Core MVP (Always On)
- Capture items (receipt/invoice/payment/photo/note/voice memo)
- Voice command overlay (push-to-talk)
- Timeline + search
- Undo last action
- Basic export
- Baseline security

### Plugins (On Request)
- Calendar plugin
- Diary plugin
- Revenue engine plugin
- Team plugin (master-slave role model)
- Advanced export plugin
- Cloud sync plugin
- Advanced voice plugin

## 7. Voice-First Requirements
- Commands: capture, label, link, search, export, summarize, undo.
- One clarification maximum when confidence/slots are insufficient.
- TTS default short mode.
- Sensitive details never spoken unless explicitly requested.
- Global commands available in key flows: cancel, stop, undo, repeat.

## 8. Offline Requirements
- Capture must succeed without network.
- OCR/transcription/sync tasks queued locally and retried safely.
- User can continue capture/search while queue processes.

## 9. Security and Privacy Requirements
- Biometric/PIN lock.
- Encryption at rest and TLS in transit.
- Consent-aware outreach behavior.
- RBAC for team mode, owner-controlled sensitive actions.

## 10. Success Metrics
- P50 voice-to-action <= 3s
- P90 voice-to-action <= 5s
- Core capture completion >= 95%
- Core intent correction rate <= 10%
- Crash-free sessions >= 99.5%

## 11. Release Criteria (MVP)
- Acceptance baseline tests pass.
- Offline capture and queue recovery verified.
- Safety/privacy checks pass.
- Plugin gating behavior validated.

## 12. Assumptions and Risks
- Assumption: users accept push-to-talk as MVP interaction model.
- Risk: noisy environments reduce ASR confidence; mitigation via threshold + one-step clarification.

## 13. Sign-Off
- Product Lead
- Engineering Lead
- QA Lead
- Security/Compliance Lead

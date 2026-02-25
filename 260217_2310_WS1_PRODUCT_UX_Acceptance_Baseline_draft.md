# WS1 Acceptance Criteria Baseline Final

## A. Core Capture and Voice
- AC-01: "Capture receipt" creates item with timestamp and at least one label.
- AC-02: "Record payment 240 from John" creates payment item and links client, or asks one clarification.
- AC-03: "Undo last action" reverts the most recent change safely.

## B. Voice Interaction Quality
- AC-04: Overlay always shows transcript + inferred action before execution when confidence is not high.
- AC-05: Clarification is limited to one question for missing required slot.
- AC-06: Global commands (cancel/stop/undo/repeat) work in all primary flows.

## C. Offline Behavior
- AC-07: Offline capture succeeds and persists locally.
- AC-08: OCR/transcription jobs queue and retry after connectivity returns.
- AC-09: Reconciliation updates do not duplicate items or break links.

## D. Safety and Privacy
- AC-10: Sensitive values are not spoken by default.
- AC-11: Sensitive details are spoken only after explicit user request.

## E. Plugin Boundaries
- AC-12: Disabled plugin screens are hidden.
- AC-13: Disabled plugin actions are blocked in API and voice layer.

## F. Performance
- AC-14: P50 voice-to-action <= 3 seconds.
- AC-15: P90 voice-to-action <= 5 seconds.

## G. Exit Conditions for WS1
- All AC items reviewed by Product + Engineering + QA.
- Open issues recorded with owner and target date.

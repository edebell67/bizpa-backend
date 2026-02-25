# WS1 UX Flows and Voice Dialogues Final

## 1. Home Capture Flow
1. User taps mic or speaks command.
2. Overlay displays transcript and inferred action.
3. User confirms, edits, or cancels.
4. App executes action and confirms completion.
5. Undo option available briefly post-action.

Voice lines:
- "Listening."
- "Saved."
- "I need one detail: amount, or say skip."

## 2. Voice Overlay Lifecycle
- Idle -> Listening -> Parsing -> Confirm Required -> Execute -> Confirmation -> Undo Window
- Error branch: Parsing fail -> retry prompt -> cancel option.

## 3. Capture Flows
### Receipt
- Command: "Capture receipt"
- Camera opens, image saved, OCR queued (or immediate if online), default label applied if missing.

### Invoice
- Command: "New invoice for John, 240 pounds, due Friday"
- Required slots parsed; missing slot triggers one clarification max.

### Payment
- Command: "Record payment 240 from John by bank transfer"
- Payment item created and linked to client/invoice if identified.

### Photo
- Command: "Take before photo for John's bathroom"
- Capture + description + client/job link.

### Note / Voice Memo
- Command: "Note customer wants quote for tiling"
- Note created, auto-label suggested.

## 4. Search and Export Flows
### Search
- Command: "Show unpaid invoices"
- List top matches with optional follow-up action.

### Export
- Command: "Export last month for accountant"
- Generate export package and prompt sharing channel.

## 5. Global Voice Commands
- cancel
- stop
- undo
- repeat

## 6. Clarification and Fallback Policy
- If confidence medium or required slot missing: ask one question.
- Provide 2-3 options and allow skip.
- If low confidence: retry or save as draft.

## 7. Offline UX States
- Queue badge indicates pending OCR/transcription/sync.
- Saved confirmation must still happen offline.
- Reconciliation updates item status without breaking links.

## 8. Accessibility and Field Usability
- Large tap targets and high-contrast controls.
- Minimal steps for gloved/dirty-hand operation.
- Haptic and concise audio confirmations.

## 9. Sensitive Voice Behavior
- No sensitive amounts/contact details spoken by default.
- Explicit request required: "Read invoice amount."

## 10. Plugin UX Flows (Enabled On Request)
### Calendar Plugin
- "Add reminder tomorrow at 9"
- Day/week agenda view.

### Diary Plugin
- "Create diary entry: replaced radiator valve"
- Date-based browse and search.

### Team Plugin
- Owner assigns task: "Assign this job to Alex"
- Permission checks enforced.

### Revenue Plugin
- "Show follow-ups"
- "Send reminder to John" with mandatory confirmation.

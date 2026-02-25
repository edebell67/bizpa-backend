# WS3 Voice Intent and Slot Specification (Draft)

## 1. Scope
Defines voice intents, slots, confidence thresholds, clarification policy, fallback behavior, and safety rules for core and plugin-gated features.

## 2. Intent Catalog
### Core Intents (MVP)
- capture_receipt
- capture_invoice
- capture_payment
- capture_photo
- create_note
- start_voice_memo
- stop_voice_memo
- search_items
- export_range
- summarise_today
- undo_last_action

### Plugin Intents
- calendar_plugin: create_calendar_event, show_calendar
- diary_plugin: create_diary_entry, show_diary
- revenue_engine_plugin: show_followups, send_message, mark_paid
- team_plugin: assign_item, assign_job, switch_workspace

## 3. Slot Schema
Common slots:
- amount (GBP default)
- date_range/date_ref
- client_name
- job_name
- label
- status
- channel
- payment_method
- item_type

Intent-specific minimum required slots:
- capture_payment: amount, client_name
- capture_invoice: client_name, amount
- send_message: client_name OR target_group, message_purpose
- mark_paid: invoice_ref OR (client_name + amount)
- export_range: date_range

## 4. Confidence and Decision Policy
- confidence >= 0.80: execute with short confirmation.
- 0.55 <= confidence < 0.80: ask one clarification.
- confidence < 0.55: retry prompt or save draft.

If required slot missing:
- Ask one targeted question.
- Offer 2-3 suggestions.
- Allow "skip" where safe.

## 5. Clarification Templates
- "I need one detail: amount, or say skip."
- "Did you mean John Smith or John Electrical?"
- "Say today, this week, or custom range."

## 6. Fallback and Error Handling
- no_speech: "I didn't catch that. Try again or say cancel."
- asr_uncertain: confirm transcript before action.
- nlu_conflict: choose between top 2 intents.
- action_error: explain failure, keep draft, offer retry.

## 7. Safety Rules
- Sensitive data (amounts, personal contact details) not spoken by default.
- Read-sensitive command requires explicit request.
- Sending messages and financial state changes require confirmation.

## 8. Undo Semantics
- Undo supported for latest reversible action.
- Non-reversible actions return guidance (e.g., follow-up cancellation flow).

## 9. Plugin Gating Rules
- If plugin disabled, intent is rejected with:
  - "This feature is not enabled for your workspace."
- All gating enforced in intent router and backend permission checks.

## 10. Pending WS2 Dependencies
- Final intent -> endpoint mapping.
- Final payload schemas and error contracts.
- Idempotency token placement for send/export actions.

# WS3 Voice Dialogue and Safety Playbook (Draft)

## 1. Response Style
- Default short confirmations.
- Verbose mode optional.
- No sensitive detail read-out unless explicitly requested.

## 2. Standard Confirmation Lines
- "Saved."
- "Linked to John."
- "Reminder queued."
- "Export ready."

## 3. Mandatory Confirm Actions
- send_message
- mark_paid
- delete/archive actions
- bulk operations

Prompt format:
- "Confirm send reminder to John now?"

## 4. Clarification Strategy
- One question max.
- If unresolved, save draft and continue.

## 5. Safety Guardrails
- Hide sensitive TTS unless explicit "read details".
- Private mode forces redacted speech.
- Team mode obeys role-based info visibility.

## 6. Accessibility Constraints
- Commands always available: cancel, stop, undo, repeat.
- Large controls and low cognitive load prompts.

## 7. Error Messaging
- Use actionable error text.
- Include recovery path in every error response.

## 8. Pending WS2 Dependencies
- Server-side error code mapping.
- Permission error payload wording.

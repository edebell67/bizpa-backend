# Deliverable 5: UX Flows and Voice Dialogues [V20260218_0015]

## 1. Primary Capture Flow
1. **Trigger**: User taps mic or speaks "Listening".
2. **ASR**: User dictates (e.g., "Capture receipt 42 pounds 10 for Fuel").
3. **Parsing**: Intent: `capture_receipt`, Slot: `amount=42.10`, `label=Fuel`.
4. **Execution**: Item created, OCR queued.
5. **Confirmation**: TTS: "Saved 42 pound 10 receipt, tagged Fuel."

## 2. Clarification Flow
- **Scenario**: Missing amount for payment.
- **App**: "How much was the payment? Say the amount or say skip."
- **User**: "50 pounds."
- **App**: "Saved 50 pounds."

## 3. Global Commands
- **Cancel**: Aborts current flow immediately.
- **Stop**: Stops ASR listening and TTS output.
- **Undo**: Reverts the last DB change (available for 10 seconds).
- **Repeat**: Re-plays the last TTS confirmation.

## 4. Privacy Guardrails
- **Rule**: Amounts and client PII are never read aloud in the initial confirmation unless "Verbose Mode" is toggled ON.
- **Default**: "Saved receipt." vs **Verbose**: "Saved 42 pound 10 receipt for Fuel."

# WS3 Voice Test Matrix (Draft)

## 1. Functional Intent Tests
- Each core intent: happy path, missing slot path, low-confidence path.
- Each plugin intent: enabled vs disabled behavior.

## 2. Confidence Threshold Tests
- >=0.80 executes.
- 0.55-0.79 clarifies once.
- <0.55 retries/saves draft.

## 3. Safety Tests
- Sensitive details not spoken by default.
- Explicit read-details works when allowed.
- Confirm-required actions cannot bypass confirmation.

## 4. Offline Tests
- Voice command capture offline with queued action.
- Deferred execution/reconciliation checks.

## 5. Role and Permission Tests
- Team member denied restricted actions.
- Owner/admin allowed actions.

## 6. Performance Tests
- P50 and P90 voice-to-action latency measurements.
- ASR timeout and retry behavior.

## 7. Pending WS2 Dependencies
- API payload validation tests.
- End-to-end idempotency tests on server contracts.

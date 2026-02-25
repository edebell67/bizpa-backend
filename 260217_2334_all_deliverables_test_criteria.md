# Test Criteria: All Identified Deliverable Items

## Purpose
Defines test criteria for all identified deliverables to verify completeness, quality, consistency, and readiness.

## Scoring Model
- `Pass`: Criterion fully satisfied with evidence.
- `Partial`: Partially satisfied, remediation required.
- `Fail`: Not satisfied.
- Evidence required for every criterion (doc section, artifact path, screenshot/log, or test output).

## Deliverable 1: PRD (Voice-First)
### Test Criteria
1. Problem statement and target user segments are explicit and UK context is clear. `[Pass]`
2. Goals/non-goals are bounded and align to MVP constraints. `[Pass]`
3. Core value proposition is measurable (speed/capture/retrieval). `[Pass]`
4. Voice-first principles are explicit (command/dictation/confirmation/TTS). `[Pass]`
5. Offline-first expectations are defined per core journey. `[Pass]`
6. Privacy/safety behavior for sensitive voice output is specified. `[Pass]`
7. Core vs plugin scope split is explicit and consistent. `[Pass]`
8. KPIs and release criteria are measurable. `[Pass]`
9. Assumptions, risks, and sign-off roles are included. `[Pass]`

### Pass Evidence
- PRD file with mapped headings and KPI table.
- **Artifacts**: `260217_2310_WS1_PRODUCT_UX_PRD_draft.md`.

## Deliverable 3: Voice Intent Specification
### Test Criteria
1. Intent catalog complete for core and plugin-gated features. `[Pass]`
2. Slot schema defined with examples and normalization rules. `[Pass]`
3. Required-slot rules exist per intent. `[Pass]`
4. Confidence threshold policy is explicit and testable. `[Pass]`
5. Clarification policy enforces one-question maximum. `[Pass]`
6. Fallback behavior defined for no-speech/low-confidence/conflict/errors. `[Pass]`
7. Safety rules prevent sensitive read-out by default. `[Pass]`
8. Undo behavior mapped per action class. `[Pass]`
9. Intent-to-permission map is defined (or flagged pending WS2). `[Pass]`

### Pass Evidence
- Voice spec with threshold table and sample utterance matrix.
- **Artifacts**: `docs/deliverable_3_voice_spec.md`, `backend/src/controllers/voiceController.js`, `backend/test_voice_api.js`.

## Deliverable 4: API Outline
### Test Criteria
1. Endpoint inventory is complete (auth, capture, search, export, plugin modules, sync). `[Pass]`
2. Request/response payloads are defined for each endpoint. `[Pass]`
3. Auth and permission scopes are defined. `[Pass]`
4. Idempotency behavior exists for write-sensitive operations. `[Pass]`
5. Conflict resolution response format is defined. `[Pass]`
6. Error taxonomy/status codes are documented. `[Pass]`
7. Pagination/filter/sort conventions are consistent. `[Pass]`
8. Versioning strategy and backward compatibility policy are included. `[Pass]`

### Pass Evidence
- API contract document with example payloads and error responses.
- **Artifacts**: `docs/api_endpoint_inventory.md`, `docs/json_schema_definitions.md`, `docs/sync_protocol_policy.md`.

## Deliverable 5: UX Flow Descriptions (Voice Dialogues)
### Test Criteria
1. Each core journey has a step-by-step path. `[Pass]`
2. Voice overlay lifecycle is explicitly documented. `[Pass]`
3. Voice prompts/confirmations are scripted. `[Pass]`
4. Clarification/fallback branches are included. `[Pass]`
5. Offline-state behavior appears in each relevant flow. `[Pass]`
6. Accessibility constraints are integrated (large controls, low-friction flow). `[Pass]`
7. Sensitive-data voice behavior is included. `[Pass]`
8. Plugin flows are clearly gated and separated from core. `[Pass]`

### Pass Evidence
- UX flow pack with dialogue snippets and branch states.
- **Artifacts**: `260217_2310_WS1_PRODUCT_UX_Flows_and_Dialogues_draft.md`.

## Deliverable 6: MVP Build Plan
### Test Criteria
1. Milestones have clear scope and outcomes. `[Pass]`
2. Dependencies and sequencing are explicit. `[Pass]`
3. Owners are assigned by function (product/engineering/QA/security). `[Pass]`
4. Estimates and risk buffer are present. `[Pass]`
5. Milestone exit criteria are testable. `[Pass]`
6. Test gates mapped into each milestone. `[Pass]`
7. Rollback/contingency steps defined. `[Pass]`
8. Beta rollout and monitoring plan included. `[Pass]`

### Pass Evidence
- Build plan with milestone table and exit criteria checklist.
- **Artifacts**: `docs/deliverable_6_build_plan.md`. Milestone 1 Complete.

## Deliverable 7: Risks and Mitigations
### Test Criteria
1. Risks include severity and likelihood. `[Pass]`
2. High/critical risks have owner and mitigation. `[Pass]`
3. Detection signals and monitoring are defined. `[Pass]`
4. Contingency plans exist for critical scenarios. `[Pass]`
5. Privacy/GDPR risks and controls are mapped. `[Pass]`
6. Abuse/misuse and role escalation cases are addressed. `[Pass]`
7. Residual risk is documented. `[Pass]`
8. Review cadence and update owner are defined. `[Pass]`

### Pass Evidence
- Risk register with mitigation and review schedule.
- **Artifacts**: `docs/risk_register_mitigations.md`.

## Deliverable 8: Message Templates + Voice Variants
### Test Criteria
1. Template set complete across required purposes. `[Pass]`
2. UK tone is consistent (short/direct/polite). `[Pass]`
3. Placeholder variables and validation rules are defined. `[Pass]`
4. Channel-specific variants are present (SMS/WhatsApp/email). `[Pass]`
5. Spoken short variants are present for TTS. `[Pass]`
6. Consent checks are mapped before send. `[Pass]`
7. Fallback templates exist for missing data/permissions. `[Pass]`
8. Outcome logging fields are mapped. `[Pass]`

### Pass Evidence
- Template library with written and spoken variants.
- **Artifacts**: `docs/revenue_message_templates.md`, `docs/security_privacy_architecture.md`.

## Cross-Deliverable Consistency Criteria
1. Core vs plugin boundaries are consistent across all docs. `[Pass - WS2/WS4]`
2. Voice safety rules are consistent in PRD/UX/intent/API. `[Pass - WS4/WS2]`
3. Offline-first behavior is consistent in PRD/UX/API/build plan. `[Pass - WS2]`
4. RBAC/team controls align across PRD/data/API/risk docs. `[Pass - WS4/WS2]`
5. Acceptance criteria trace to at least one deliverable section each. `[Pass - WS2/WS4]`
6. Intent-to-endpoint mapping is complete or explicitly marked pending. `[Pass - WS2]`
7. Every plugin feature has module gating + migration notes. `[Pass - WS2]`

## Workstream-Specific Test Criteria
### WS1_PRODUCT_UX
1. PRD, flows, and acceptance baseline are internally consistent. `[Pass]`
2. Voice dialogue scripts match intent behaviors. `[Pass]`
3. Acceptance criteria are measurable and executable. `[Pass]`

### WS2_DATA_API
1. Data model fields map to API payloads. `[Pass]`
2. Index and query assumptions align to UX filter/search needs. `[Pass]`
3. Sync/idempotency strategy covers replay and conflicts. `[Pass]`

### WS3_VOICE
1. Intents and slots map to business actions and permissions.
2. Confidence policy and fallback behavior are testable.
3. Sensitive speech controls are enforceable.

### WS4_SEC_OPS_REVENUE
1. Security/RBAC controls mapped to role actions. `[Pass]`
2. GDPR controls mapped to outreach and storage behavior. `[Pass]`
3. Message templates comply with consent and channel rules. `[Pass]`

## Exit Gate Criteria (Final Package)
1. All deliverable-level criteria are `Pass`. `[Partial - MS1 Done]`
2. No unresolved `Fail` items remain. `[Pass]`
3. `Partial` items have owner, deadline, and mitigation accepted. `[Pass]`
4. Integration review confirms no contract contradictions. `[Pass]`
5. Versioned delivery package assembled and signed off. `[Partial]`

## Suggested Test Execution Order
1. WS1 criteria
2. WS2 criteria
3. WS3 criteria
4. WS4 criteria
5. Cross-deliverable consistency
6. Final exit gate

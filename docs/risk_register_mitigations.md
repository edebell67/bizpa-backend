# Risk Register & Mitigations [V20260218_0000]

## 1. Operational Risks (User/Business)

| Risk ID | Description | Severity | Likelihood | Mitigation Strategy | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OP-01** | **Accidental Voice Recording**: The app records confidential conversations (e.g., client meetings) unintentionally. | High | Medium | **Visual Feedback**: Distinct "Listening" UI state (red/flashing). <br> **Timeout**: Strict auto-stop after 30s of silence. | Product / UX |
| **OP-02** | **Public TTS Leak**: Sensitive financial data (e.g., "Invoice Total £5,000") is read aloud in a public space. | High | High | **"Verbose Mode" Toggle**: Default TTS is concise ("Saved"). <br> **Explicit Consent**: Requires command ("Read details"). | Voice / UX |
| **OP-03** | **Mis-Sent Revenue Message**: An automated "Chasing Payment" SMS is sent to the wrong client or too frequently. | Medium | Medium | **Manual Confirm**: Every bulk action requires a final "Confirm Send" tap. <br> **Frequency Cap**: Limit 1 chase per 7 days per invoice. | Revenue Ops |
| **OP-04** | **Data Loss (Device Lost)**: User loses phone with un-synced data. | High | Low | **Daily Cloud Backup**: Encrypted dump to S3 (Premium feature). <br> **Local File Export**: Prompt user to export monthly. | Engineering |

## 2. Technical Risks (System/Platform)

| Risk ID | Description | Severity | Likelihood | Mitigation Strategy | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **Offline Queue Jam**: Pending OCR/Sync jobs accumulate, causing app sluggishness or battery drain. | Medium | Low | **Batching**: Process in small chunks (5 items). <br> **Backoff**: Exponential retry delay for failed uploads. | Engineering |
| **TC-02** | **Sync Conflict (LWW)**: Two users edit the same invoice; one edit is silently discarded. | Low | Low | **Audit Trail**: Log the discarded edit in `audit_events`. <br> **Field Locking**: Prevent `FIELD` staff from editing critical fields. | Engineering |
| **TC-03** | **ASR Accuracy (Accents)**: Voice command fails for strong regional accents or noisy environments. | Medium | High | **Confidence Threshold**: If < 70%, ask 1 clarification. <br> **Text Edit**: Always allow manual correction before confirming. | Voice AI |
| **TC-04** | **GDPR Erasure Failure**: Deleted client data remains in backups or logs. | High | Very Low | **Tombstoning**: Replace PII with "DELETED" in logs. <br> **Retention Policy**: Auto-purge logs > 30 days. | Security |

## 3. Compliance Risks (Legal)

| Risk ID | Description | Severity | Likelihood | Mitigation Strategy | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CP-01** | **Unsolicited Marketing**: User sends promo messages to clients who haven't consented. | High | Low | **Consent Field**: Force check of `consent_to_contact` before enabling template. | Legal / Prod |
| **CP-02** | **Tax Calculation Error**: App mis-categorizes an expense, leading to incorrect tax returns. | High | Low | **Disclaimer**: Explicitly state "For record keeping only; consult an accountant." <br> **Export Pack**: Provide raw data for professional review. | Legal |

## 4. Detection & Monitoring Signals
| Risk Area | Detection Method | Alerting Threshold |
| :--- | :--- | :--- |
| **Voice Accuracy** | Log intent confidence scores. | Weekly average < 75% triggers NLU review. |
| **Sync Failures** | Monitor `job_queue` for 'failed' status with high retry counts. | > 5% failure rate in 24h triggers dev alert. |
| **Outreach Quality** | Track `outcome` in `outreach_logs` (e.g., 'wrong_number'). | > 10% 'wrong_number' triggers data audit. |
| **App Performance** | Telemetry on voice-to-action latency. | P90 > 5s triggers performance optimization. |

## 5. Residual Risk & Review Cadence
- **Residual Risk**: Despite encryption and PINs, a device in an "unlocked" state remains a risk if stolen. This is mitigated by the 15-minute auto-lock policy.
- **Review Cadence**: This Risk Register will be reviewed **every 3 months** by the Product and Security leads.
- **Update Owner**: Security Lead (V20260218_0000).

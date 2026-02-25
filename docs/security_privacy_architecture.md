# Security & Privacy Architecture [V20260218_0000]

## 1. Objectives
- Ensure **GDPR Compliance** for UK small businesses (Data Processor role).
- Secure sensitive financial data (Encryption at Rest/Transit).
- Protect against unauthorized access (Device Authentication).
- Provide transparency and control to end-users (Consent & Rights).

## 2. Authentication Strategy
### A. Device Level (Local)
- **PIN/Biometric**: Mandatory 4-digit PIN or Fingerprint/FaceID to open the app after 15 minutes of inactivity.
- **Session Timeout**: JWT tokens refresh every 1 hour; requires re-authentication after 24 hours.

### B. API Level (Server)
- **JWT (JSON Web Tokens)**: Used for all API requests. Contains `user_id`, `role`, and `scope`.
- **API Keys**: Not used for mobile clients.
- **Device Fingerprinting**: `device_id` sent with every request to detect account sharing or unauthorized cloning.

## 3. Data Encryption
### A. At Rest (Local SQLite)
- **SQLCipher**: The entire SQLite database file is encrypted using AES-256.
- **Key Management**: The encryption key is derived from the user's PIN + a device-specific salt, stored in the secure hardware enclave (iOS Keychain / Android Keystore).

### B. At Rest (Server)
- **Database**: AES-256 encryption for sensitive columns (`client_name`, `phone`, `email`, `amount`).
- **Backups**: Encrypted before storage in S3/Blob.

### C. In Transit
- **TLS 1.3**: All API communication is over HTTPS. Certificate pinning is recommended for the mobile app.

## 4. GDPR Controls (UK Data Protection Act 2018)
The app acts as a **Data Processor** for the small trader (Data Controller).

### A. Consent Management (`clients` table)
- **Field**: `consent_to_contact` (Boolean).
- **UX**: Before sending a Revenue Engine message (SMS/WhatsApp), the app checks this flag.
- **Toggle**: Easy ON/OFF switch in Client Details.

### B. Right to Access (Subject Access Request)
- **Export Feature**: `Generate Client Report` produces a PDF/JSON of all data held on a specific client (Notes, Jobs, Invoices).
- **Voice Command**: "Export data for client John Smith" triggers this flow.

### C. Right to Erasure ("Right to be Forgotten")
- **Delete Action**: Hard delete of `client` record cascades to anonymize linked `capture_items` (keeping financial totals but removing PII).
- **Audit Log**: The deletion event is logged, but the PII in the log is redacted.

### D. Data Minimization
- **Retention Policy**:
  - `voice_events` (Audio/Transcripts): Deleted after 30 days unless flagged for "Improvement".
  - `job_queue` (Logs): Cleared after 7 days.
  - `audit_events`: Kept for 6 years (Tax requirement).

## 5. Voice Privacy
- **Sensitive Data**: The TTS engine **never** reads aloud `amount`, `bank_details`, or `client_address` unless explicitly commanded ("Read the total").
- **Visual Indicator**: A clear "Listening" icon is displayed whenever the microphone is active.
- **Local Processing**: Priority is given to on-device ASR where possible to minimize data sent to the cloud.

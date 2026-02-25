# Mobile Continuous Capture App for Small Traders — Voice-First Build Prompt (MVP + Revenue Engine)

You are a senior product + engineering lead. Design and specify a **voice-first** mobile app for small traders (UK-first) that continuously captures business information and turns it into structured, timestamped, searchable records — and then uses that data to drive **repeat revenue (re-servicing previous clients)** and **lead generation from existing capture** (reactivation + referrals + follow-up).

This version must prioritize **speech-to-action** and **voice responses** so traders can operate hands-free while working.

---

## 0) Voice-first principle (top priority)

### The app must support:
- **Voice command execution** for key workflows (capture, label, link, search, export, follow-ups).
- **Voice dictation** for notes and descriptions.
- **Voice confirmations** to reduce tapping (e.g., “Confirm”, “Link to John”, “Mark paid”).
- **Voice responses (TTS)** for summaries and confirmations (“Saved receipt, tagged Fuel, £42.10, today 09:12.”).
- **Hands-free mode** for on-site usage (big mic button + “listening” state; optional wake phrase).

### Hard constraints
- Works **offline-first**: voice capture should still record; transcription can be queued.
- Must avoid noisy UX: short responses by default; “verbose mode” optional.
- Must be safe: never read sensitive details aloud unless user explicitly requests (“Read invoice amount”).
- Must be fast: voice-to-action completion ideally **< 5 seconds**.

---

## 1) Product goal & non-goals

### Goal
Let a small trader capture invoices, receipts, payment details, images, notes, voice, and miscellaneous items in seconds, automatically label them (or suggest labels), timestamp them, and make them easy to retrieve and export. Then deliver revenue features: re-service reminders, client reactivation lists, referral prompts, and one-tap outreach — all operable via voice.

### Non-goals (for MVP)
- Full accounting package replacement  
- Bank feed reconciliation (phase 2)  
- Automated tax submission (phase 2)  
- Any “scraping” or acquiring leads without user-entered consent (avoid GDPR risk)

---

## 2) Users & primary use cases (voice-inclusive)

### Primary user
Small trader (sole trader / small business owner) who needs:
- Proof of expenses and income  
- Easy organization without admin overhead  
- Follow-ups to get paid and rebook work  
- Hands-free usage while driving/on-site/in gloves

### Key use cases (must support voice)
- “**Capture receipt**” → open camera → snap → OCR → voice confirm tags  
- “**New invoice** for John, £240, due Friday” → create invoice item + link client/job  
- “**Record payment** £240 from John by bank transfer” → link to invoice  
- “**Take before photo** for John’s bathroom job” → capture image + label/link  
- “**Note**: customer wants quote for tiling” → create note item + label as follow-up lead  
- “**Voice memo**” (record) → transcribe → link to client/job  
- “**Show unpaid invoices**” → list top 5 + ask if user wants to send reminders  
- “**Send reminder** to John” → message template + confirm + log outcome  
- “**Export last month for accountant**” → produce CSV + evidence pack + confirm share method  

---

## 3) Core principles (hard constraints)

- **Offline-first:** capture must work with no signal; queue OCR/transcription if needed.  
- **2-second capture:** minimal typing; defaults + later review.  
- **Everything is an “Item”:** unify captures via a single object model; attachments allowed.  
- **Label + timestamp required:** every item must have a created timestamp and at least one label (auto label if user doesn’t add).  
- **Voice-first usability:** top workflows must be executable via speech with minimal follow-up questions.  
- **Privacy & compliance:** user owns data; no harvesting leads from third parties without explicit input/consent; GDPR-friendly.

---

## 4) Voice system requirements (NEW)

### 4.1 Interaction modes
1. **Push-to-talk (MVP default):** large mic button.  
2. **Hands-free mode (optional MVP):** keeps listening while screen is active, with “stop listening” command.  
3. **Wake phrase (phase 2):** optional and opt-in.

### 4.2 Voice pipeline
- **ASR (speech-to-text):** on-device if possible; otherwise cloud; must support queued transcription.
- **NLU (intent parsing):** classify into intents; extract slots (amount, client, label, date, type).
- **Dialogue manager:** minimal clarification; confirms assumptions.
- **TTS:** short confirmations + summaries; silent mode toggle.

### 4.3 Intents (minimum list)
- `capture_receipt` (camera flow)
- `capture_invoice` (invoice creation flow)
- `capture_payment` (payment record + link)
- `capture_photo` (photo + description)
- `create_note` (typed/voice note)
- `start_voice_memo` / `stop_voice_memo`
- `label_item` (apply labels to last item or selected item)
- `link_client` / `link_job` (attach last item to client/job)
- `search_items` (by date, label, client, amount, status, keyword)
- `show_followups` (reservice due, unpaid, inactive, referral)
- `send_message` (via template + channel)
- `mark_paid` / `mark_unpaid`
- `export_range` (date range, client/job)
- `summarise_today` / `summarise_week`
- `undo_last_action` (must exist)

### 4.4 Slot extraction (examples)
- Amount: “£42.10”, “forty two pounds ten”
- Dates: “today”, “yesterday”, “last Friday”, “1st Feb”
- Client: “John Smith”, “Acme Kitchens”
- Job: “bathroom refit”, “gutter clean”
- Status: “paid”, “unpaid”, “needs review”
- Labels: “Fuel”, “Materials”, “VAT”, “Chase”, “Before photo”

### 4.5 Clarification policy (keep it tight)
If confidence low or missing a required slot:
- Ask **one** question max.
- Offer **2–3 options**.
- Allow “skip” and save as draft.

Example:
- User: “Record payment from John.”
- App: “How much was it? You can say an amount, or say ‘skip’.”

### 4.6 Voice responses (TTS) rules
- Default to **short**: “Saved.” “Tagged Fuel.” “Linked to John.”  
- When asked “what did I do today?” respond with summary (counts + totals) without reading private details unless requested.
- Offer “read details” as an explicit follow-up.

---

## 5) Information architecture

Specify the core objects and relationships.

### 5.1 CaptureItem (universal spine)
Fields:
- `id` (uuid)  
- `created_at` (device time), `captured_at` (user-confirmed optional)  
- `type`: `invoice | receipt | payment | image | note | voice | misc`  
- `status`: `draft | confirmed | reconciled | archived`  
- `labels[]` (tags)  
- `counterparty_id` (optional)  
- `client_id` (optional)  
- `job_id` (optional)  
- `amount` (optional), `currency` (default GBP)  
- `tax_flag` (optional), `vat_amount` (optional)  
- `due_date` (optional, for invoices)  
- `extracted_text` (OCR/transcript), `extraction_confidence`  
- `raw_note` (user text)  
- `location` (optional)  
- `attachments[]`: (`file_id`, `kind=image/pdf/audio`, `created_at`, `metadata`)  
- `linked_items[]` (e.g., payment → invoice)  
- `audit`: `updated_at`, `device_id`  

**Voice additions:**
- `voice_command_source_text` (optional: transcript of the command)
- `voice_action_confidence` (intent confidence)
- `voice_confirmation_audio_id` (optional: store confirmation audio if needed for audit/debug)

### 5.2 Client
- `id`, `name`, `phone/email`, `address` (optional)  
- `consent_to_contact` (boolean + timestamp)  
- `labels[]` (optional e.g., “VIP”, “Commercial”)  
- `created_at`, `last_contacted_at`

### 5.3 Job (Service history entity)
- `id`, `client_id`  
- `job_type/service_category` (enum or label)  
- `job_date_start`, `job_date_end` (optional)  
- `status`: `lead | quoted | booked | in_progress | completed | lost`  
- `value_estimate` (optional)  
- `next_due_date`  
- `notes` (optional)  
- `linked_capture_items[]`  

### 5.4 OutreachLog
- `id`, `client_id` and/or `job_id`  
- `channel`: `sms | whatsapp | email | phone | in_app`  
- `message_template_id` (optional)  
- `sent_at`, `outcome`: `no_response | replied | booked | declined | wrong_number`  
- `follow_up_due_at` (optional)  
- `notes`

### 5.5 TriggerRule (re-servicing + lead prompts)
- `id`  
- `applies_to`: `job_type` or `label`  
- `trigger_type`:  
  - `time_since_last_job`  
  - `seasonal_window`  
  - `invoice_due_unpaid`  
  - `post_job_referral_prompt`  
  - `reactivation_if_inactive`  
- `action`:  
  - `create_task`  
  - `suggest_outreach_template`  
- `enabled` boolean  

### 5.6 MessageTemplate
- `id`  
- `purpose`: `reservice | chase_payment | referral | reactivation | quote_followup`  
- channel suitability flags  
- variables: `{client_name}`, `{job_type}`, `{last_job_date}`, `{invoice_amount}`, etc.  
- UK tone: short, direct, polite.

---

## 6) UX: required screens and flows (voice-enabled)

### Required screens
1. **Home (Capture Now)**
   - Big capture buttons + **big mic** button  
   - Quick search bar  
   - Toggle: Voice replies (On/Off)  

2. **Inbox / Timeline**
   - Filter chips: Today, This Week, Drafts, Unpaid, Needs Review  
   - “Speak to filter” prompt: “Say ‘show unpaid invoices’”  

3. **Voice Command Overlay (NEW)**
   - Shows recognized text + interpreted action (“Recording payment…”)  
   - Allows: **Confirm / Edit / Cancel**  
   - “Undo” button

4. **Capture flows per type**
   - Receipt/Invoice: camera + crop + OCR → voice prompt “Tag it?” → confirm  
   - Payment: voice-first: amount + from/to + method + link invoice  
   - Photo: voice description prompt “What’s this?”  
   - Note: dictate + auto label suggestions  
   - Voice: record memo → transcribe → link to client/job

5. **Follow-ups (Revenue Engine)**
   - Voice list: “You have 3 unpaid invoices, 2 re-service due.”  
   - Voice action: “Send reminders to all” (must require confirm)

6. **Export**
   - Voice: “Export last month for accountant”  
   - Response: “Export ready. Do you want to share by email, WhatsApp, or save to files?”

### Voice UX requirements
- Always support “**cancel**”, “**stop**”, “**undo**”, “**repeat**”.  
- If user is in gloves/dirty hands scenario: app should still be usable with voice only.  
- Minimise multi-turn dialogues; prefer reasonable defaults.

---

## 7) Data extraction & intelligence (MVP vs Phase 2)

### MVP
- OCR for images (basic)  
- Voice transcription (cloud ok)  
- Intent parsing + slot extraction for the listed intents  
- Suggest labels based on keywords + past patterns  
- Confidence scoring; if low → ask 1 clarification or save draft

### Phase 2
- On-device ASR/TTS  
- Wake phrase  
- Bank feed import  
- Smarter payment ↔ invoice matching  
- Auto job detection from repeated patterns  

---

## 8) Lead generation design (GDPR-safe)

Deliver only:
- Reactivation leads from existing client base  
- Referral prompts (store referred contacts only if user enters with consent)  
- Follow-up leads created explicitly via notes/voice (“call back”, “needs quote”, “send estimate”)

Exclude:
- Auto-extracting third-party contact details from documents/images without consent.

---

## 9) Revenue mechanics

- Re-service reminders with outreach templates and follow-up queue  
- Inactive client reactivation lists (6/12/18 months) + one-tap voice outreach  
- Payment chasing workflow: unpaid invoices + reminders + log outcomes  
- Referral workflow: post-job prompt → message → track outcome  

App monetization:
- Freemium capture + search  
- Paid: exports, triggers, client/job module, transcription, cloud sync, multi-device

---

## 10) Technical architecture (high level, concrete)

### Offline-first architecture
- Local DB: SQLite + FTS for search  
- Local file store for attachments  
- Background job queue: OCR, transcription, sync  
- Optional cloud sync: metadata DB + encrypted object storage  
- Conflict resolution: last-write-wins + activity log for audit

### Voice architecture
- ASR provider: on-device if available; cloud fallback  
- NLU: lightweight intent classifier (rules + ML if needed)  
- Dialogue manager: one-question max clarifications  
- TTS: system voice; configurable verbosity  
- Observability: log intent confidence, failure rates, correction taps

### Security
- App lock (biometric/PIN)  
- Encryption at rest (DB + attachments)  
- Permission prompts minimal and clear  
- “Private mode” option: disable speaking sensitive data aloud

---

## 11) Acceptance criteria (must be testable)

- Voice command “Capture receipt” opens camera and saves a CaptureItem with timestamp + label (even if default “Unsorted”)  
- Voice command “Record payment £240 from John” creates payment item and links to client John (or asks one clarification)  
- Voice command “Show unpaid invoices” returns a list and can initiate “Send reminder to John” with confirmation  
- Voice command “Export last month for accountant” generates CSV + evidence pack and offers share options  
- Offline: voice memo records; transcript queues; item searchable once processed  
- “Undo last action” reverts the most recent state change  
- Voice replies can be toggled off; app remains functional

---

## 12) Deliverables you must output (what you, the agent, must produce)

Produce in order:
1. PRD (voice-first)  
2. Data model (tables/collections + indexes)  
3. Voice intent specification (intents, slots, examples, confidence thresholds, fallback rules)  
4. API outline (if sync enabled) including endpoints and payload shapes  
5. UX flow descriptions (step-by-step, including voice dialogues)  
6. MVP build plan (2–3 milestones)  
7. Risks & mitigations (noise, accents, privacy, offline limitations, mis-execution)  
8. Example message templates (UK tone) + voice versions (short spoken variants)

---

## Constraints
- Keep MVP lean and shippable.  
- Prioritise speed of capture and retrieval.  
- No bank API dependency in MVP.  
- Use GBP and UK wording by default.  
- Always include cancel/undo paths for voice actions.

# Revenue Engine Templates [V20260218_0000]

This document contains the standard message templates for the Revenue Engine, designed with a professional but direct **UK Small Trader** tone.

## 1. Re-Service Reminders (Annual/Periodic)
**Trigger**: `time_since_last_job` > 11 months (e.g., Boiler Service).

### A. SMS / WhatsApp (Casual)
> "Hi {client_name}, it's {my_business_name}. Just a quick note that your {job_type} service is due next month. Shall I pop you in the diary? Thanks, {my_first_name}."

### B. Email (Formal)
> **Subject**: Service Reminder: {job_type} Due Soon
>
> "Dear {client_name},
>
> I hope you're keeping well.
>
> Our records show that it's been a year since your last {job_type}. To keep everything running safely and efficiently, it's due for a service next month.
>
> If you'd like to book a slot, just reply to this email or give me a call on {my_phone}.
>
> Best regards,
> {my_full_name}
> {my_business_name}"

### C. Voice Prompt (TTS)
> "Re-service reminder for {client_name}. Last visit was {last_job_date}. Say 'Send' to message them, or 'Skip'."

## 2. Payment Chasing (Overdue Invoice)
**Trigger**: `invoice_due_date` passed + 3 days.

### A. SMS / WhatsApp (Polite Nudge)
> "Hi {client_name}, hope all is well. Just checking if you received the invoice for the {job_type}? It was due on {due_date}. Let me know if you need a copy. Thanks, {my_first_name}."

### B. SMS / WhatsApp (Firm - 14 Days Overdue)
> "Hi {client_name}, I haven't seen payment for the {job_type} yet (£{amount}). Please could you settle this today? Bank details are on the invoice. Thanks, {my_first_name}."

### C. Voice Prompt (TTS)
> "Invoice for {client_name} is overdue by {days_overdue} days. Say 'Remind' to send a polite nudge."

## 3. Post-Job Referral
**Trigger**: `job_status` = 'completed' + 3 days.

### A. SMS / WhatsApp
> "Hi {client_name}, thanks again for the business! If you're happy with the {job_type}, I'd really appreciate it if you could pass my number to any friends who might need similar work. Cheers, {my_first_name}."

### C. Voice Prompt (TTS)
> "Job for {client_name} marked complete. Say 'Ask for referral' to send a thank-you text."

## 4. Reactivation (Inactive Client)
**Trigger**: No activity for 18 months.

### A. SMS / WhatsApp (Seasonal)
> "Hi {client_name}, long time no see! I'm currently booking slots for {season} maintenance. If you need any {job_type} work done, just let me know. Best, {my_first_name}."

### C. Voice Prompt (TTS)
> "You haven't seen {client_name} in 18 months. Say 'Reactivate' to offer a seasonal check-up."

## 5. Fallback Templates (Missing Data)
Used when specific variables are unavailable.

| Purpose | Scenario | Template Text |
| :--- | :--- | :--- |
| **All Channels** | Client Name Missing | "Hi there, it's {my_business_name}. Just following up on our recent work. Please let me know if you need anything. Thanks!" |
| **Payment** | Amount Missing | "Hi {client_name}, just checking on the status of our last invoice. Please let me know when payment has been sent. Thanks, {my_first_name}." |
| **Generic** | Permission Denied | "Sorry, I can't send that message right now. Please check your permissions or consent settings." |

## 6. Outcome Logging Field Mapping
Every outreach action must be logged in the `outreach_logs` table.

| UI/Voice Action | `channel` | `message_content` | `outcome` (Initial) |
| :--- | :--- | :--- | :--- |
| "Send SMS" | `sms` | Body of the template used. | `no_response` |
| "Send WhatsApp" | `whatsapp` | Body of the template used. | `no_response` |
| "Send Email" | `email` | Body of the template used. | `no_response` |
| "Log Phone Call" | `phone` | User's dictated notes. | `no_response` |

*Note: `outcome` is updated to `replied`, `booked`, or `declined` based on user input or automated response parsing (Phase 2).*

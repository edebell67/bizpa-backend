# Plugin Entity Dictionary [V20260217_2345]

## 1. Calendar Plugin (`calendar_plugin`)
Supports scheduling and reminders.

### calendar_events
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | Event identifier. |
| title | TEXT | NOT NULL | Event summary. |
| description | TEXT | NULLABLE | Detailed notes. |
| start_at | TIMESTAMP | NOT NULL | Start time. |
| end_at | TIMESTAMP | NOT NULL | End time. |
| status | TEXT | NOT NULL | `scheduled | completed | canceled` |
| client_id | UUID | FK NULLABLE | Link to Client. |
| job_id | UUID | FK NULLABLE | Link to Job. |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time. |

## 2. Diary Plugin (`diary_plugin`)
Daily journal and linked work notes.

### diary_entries
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | Entry identifier. |
| entry_date | DATE | NOT NULL | The date this entry refers to. |
| content | TEXT | NOT NULL | User's journal entry. |
| client_id | UUID | FK NULLABLE | Link to Client. |
| job_id | UUID | FK NULLABLE | Link to Job. |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time. |

## 3. Revenue Engine Plugin (`revenue_engine_plugin`)
Automates follow-ups, payment chasing, and referrals.

### outreach_logs
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | Log identifier. |
| client_id | UUID | FK NOT NULL | Recipient. |
| job_id | UUID | FK NULLABLE | Subject work item. |
| channel | TEXT | NOT NULL | `sms | whatsapp | email | phone` |
| message_content | TEXT | NOT NULL | Actual sent message. |
| outcome | TEXT | NULLABLE | `replied | booked | declined | no_response` |
| sent_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Time of outreach. |
| follow_up_due_at | TIMESTAMP | NULLABLE | Next suggested touchpoint. |

### trigger_rules
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | Rule identifier. |
| trigger_type | TEXT | NOT NULL | `time_since_last_job | seasonal | unpaid_invoice` |
| trigger_config | JSON/TEXT | NOT NULL | Days, months, or status thresholds. |
| action_template_id | UUID | FK NULLABLE | Default message to suggest. |
| enabled | BOOLEAN | DEFAULT TRUE | Master toggle for this rule. |

### message_templates
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | Template identifier. |
| name | TEXT | NOT NULL | Internal name. |
| body | TEXT | NOT NULL | Template text with placeholders like `{client_name}`. |
| category | TEXT | NOT NULL | `reservice | payment_chase | referral` |

## 4. Team Plugin (`team_plugin`)
Master-Slave model for field delegation.

### teams
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | Team identifier. |
| owner_user_id | UUID | NOT NULL | The Master user. |
| name | TEXT | NOT NULL | Team display name. |

### team_members
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| team_id | UUID | FK NOT NULL | Reference to `teams`. |
| user_id | UUID | NOT NULL | User identifier. |
| role | TEXT | NOT NULL | `admin | field_staff | office_manager` |

### assignment_links
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | Link identifier. |
| entity_type | TEXT | NOT NULL | `job | capture_item` |
| entity_id | UUID | NOT NULL | ID of the assigned object. |
| assigned_to_user_id | UUID | NOT NULL | The Slave user. |
| assigned_by_user_id | UUID | NOT NULL | The Master/Admin user. |

## 5. Sync Cloud Plugin (`sync_cloud_plugin`)
Multi-device and cloud backup status.

### sync_devices
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| device_id | TEXT | PRIMARY KEY | Unique device HWID/Instance ID. |
| user_id | UUID | NOT NULL | Owner of the device. |
| last_sync_at | TIMESTAMP | NULLABLE | Last successful push/pull. |
| sync_token | TEXT | NULLABLE | Server-issued delta token. |

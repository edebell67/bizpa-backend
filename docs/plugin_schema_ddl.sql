-- Plugin Schema DDL [V20260217_2345]
-- Target: SQLite 3.3x+
-- Note: These tables are created only when the respective plugin is enabled.

-- 1. Calendar Plugin
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled')),
    client_id TEXT,
    job_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 2. Diary Plugin
CREATE TABLE IF NOT EXISTS diary_entries (
    id TEXT PRIMARY KEY,
    entry_date DATE NOT NULL,
    content TEXT NOT NULL,
    client_id TEXT,
    job_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 3. Revenue Engine Plugin
CREATE TABLE IF NOT EXISTS message_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('reservice', 'payment_chase', 'referral')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trigger_rules (
    id TEXT PRIMARY KEY,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time_since_last_job', 'seasonal', 'unpaid_invoice')),
    trigger_config TEXT NOT NULL, -- JSON string
    action_template_id TEXT,
    enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (action_template_id) REFERENCES message_templates(id)
);

CREATE TABLE IF NOT EXISTS outreach_logs (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    job_id TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email', 'phone')),
    message_content TEXT NOT NULL,
    outcome TEXT CHECK (outcome IN ('replied', 'booked', 'declined', 'no_response')),
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    follow_up_due_at DATETIME,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 4. Team Plugin
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'field_staff', 'office_manager')),
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignment_links (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('job', 'capture_item')),
    entity_id TEXT NOT NULL,
    assigned_to_user_id TEXT NOT NULL,
    assigned_by_user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sync Cloud Plugin
CREATE TABLE IF NOT EXISTS sync_devices (
    device_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    last_sync_at DATETIME,
    sync_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Additional Indexes for Plugins
CREATE INDEX IF NOT EXISTS idx_calendar_time ON calendar_events(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_diary_date ON diary_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_outreach_followup ON outreach_logs(follow_up_due_at);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignment_links(assigned_to_user_id);

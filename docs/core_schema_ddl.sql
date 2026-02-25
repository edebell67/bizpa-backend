-- Core Schema DDL [V20260217_2345]
-- Target: SQLite 3.3x+

-- 1. capture_items
CREATE TABLE IF NOT EXISTS capture_items (
    id TEXT PRIMARY KEY, -- UUID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    captured_at DATETIME,
    type TEXT NOT NULL CHECK (type IN ('invoice', 'receipt', 'payment', 'image', 'note', 'voice', 'misc')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'reconciled', 'archived')),
    amount DECIMAL(18,8),
    currency TEXT DEFAULT 'GBP',
    tax_flag BOOLEAN DEFAULT 0,
    vat_amount DECIMAL(18,8),
    due_date DATE,
    counterparty_id TEXT,
    client_id TEXT,
    job_id TEXT,
    extracted_text TEXT,
    extraction_confidence REAL,
    raw_note TEXT,
    location TEXT,
    device_id TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    voice_command_source_text TEXT,
    voice_action_confidence REAL,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 2. capture_item_labels
CREATE TABLE IF NOT EXISTS capture_item_labels (
    item_id TEXT NOT NULL,
    label_name TEXT NOT NULL,
    PRIMARY KEY (item_id, label_name),
    FOREIGN KEY (item_id) REFERENCES capture_items(id) ON DELETE CASCADE
);

-- 3. capture_item_attachments
CREATE TABLE IF NOT EXISTS capture_item_attachments (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('image', 'pdf', 'audio')),
    file_path TEXT NOT NULL,
    metadata TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES capture_items(id) ON DELETE CASCADE
);

-- 4. clients
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    consent_to_contact BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_contacted_at DATETIME
);

-- 5. jobs
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    service_category TEXT,
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'quoted', 'booked', 'in_progress', 'completed', 'lost')),
    value_estimate DECIMAL(18,8),
    next_due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- 6. voice_events
CREATE TABLE IF NOT EXISTS voice_events (
    id TEXT PRIMARY KEY,
    intent_transcript TEXT NOT NULL,
    intent_name TEXT NOT NULL,
    slot_data TEXT, -- JSON string
    confidence REAL NOT NULL,
    action_result TEXT NOT NULL CHECK (action_result IN ('success', 'clarification_needed', 'failure', 'canceled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. job_queue
CREATE TABLE IF NOT EXISTS job_queue (
    id TEXT PRIMARY KEY,
    task_type TEXT NOT NULL CHECK (task_type IN ('ocr', 'transcription', 'sync_push', 'sync_pull')),
    item_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    error_log TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    run_at DATETIME,
    FOREIGN KEY (item_id) REFERENCES capture_items(id) ON DELETE SET NULL
);

-- 8. audit_events
CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    diff_log TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Search Index (Full-Text Search)
CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
    item_id UNINDEXED,
    content,
    labels,
    client_name,
    job_category,
    tokenize='porter unicode61'
);

-- Sync Triggers (Example for capture_items)
CREATE TRIGGER IF NOT EXISTS capture_items_ai AFTER INSERT ON capture_items BEGIN
  INSERT INTO search_fts(item_id, content) VALUES (new.id, new.extracted_text || ' ' || new.raw_note);
END;

CREATE TRIGGER IF NOT EXISTS capture_items_ad AFTER DELETE ON capture_items BEGIN
  DELETE FROM search_fts WHERE item_id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS capture_items_au AFTER UPDATE ON capture_items BEGIN
  UPDATE search_fts SET content = new.extracted_text || ' ' || new.raw_note WHERE item_id = old.id;
END;

-- Required Indexes
CREATE INDEX IF NOT EXISTS idx_capture_items_created ON capture_items(created_at);
CREATE INDEX IF NOT EXISTS idx_capture_items_status ON capture_items(status, type);
CREATE INDEX IF NOT EXISTS idx_jobs_due ON jobs(next_due_date, status);
CREATE INDEX IF NOT EXISTS idx_job_queue_status ON job_queue(status, run_at);

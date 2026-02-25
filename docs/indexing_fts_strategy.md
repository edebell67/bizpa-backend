# Indexing & FTS Strategy [V20260217_2345]

## 1. Objectives
- Support **sub-second search** over thousands of records.
- Enable voice-triggered filtering (e.g., "Show all fuel receipts").
- Minimize write latency during continuous capture.
- Support offline-first retrieval without server round-trips.

## 2. Full-Text Search (FTS5)
SQLite's **FTS5** virtual table is used as the primary search engine for unstructured text.

### Schema
The `search_fts` table indexes:
- `extracted_text`: OCR from receipts/invoices and voice dictation transcripts.
- `raw_note`: User-entered comments.
- `labels`: Flattened comma-separated tags (synced via triggers).
- `client_name`: Denormalized for fast lookup.
- `job_category`: Denormalized for fast lookup.

### Tokenization
We use `porter unicode61` tokenizer to support:
- **Porter Stemming**: "cleaning" matches "clean", "cleaned".
- **Unicode Support**: Correct handling of accented characters and symbols.

### Synchronization
Synchronization is handled via **Database Triggers** on the `capture_items` table. This ensures that the search index is always consistent with the primary data store without manual application logic.

## 3. B-Tree Indexing Strategy
Traditional B-Tree indexes are applied to structured fields for high-speed filtering and sorting.

### Primary Indexes
1. `idx_capture_items_created`: Essential for the **Timeline View** (ordered by `created_at DESC`).
2. `idx_capture_items_status`: Supports filtering by `draft`, `unpaid`, or `confirmed` status.
3. `idx_jobs_due`: Powers the **Revenue Engine** and **Calendar** views (filtering by `next_due_date`).
4. `idx_job_queue_status`: Used by the background worker to find the next task to process.

## 4. Performance Constraints
- **Search Latency**: Target <100ms for local queries.
- **Write Latency**: Target <50ms per record (including FTS trigger overhead).
- **Storage Overhead**: FTS and B-Tree indexes are expected to consume ~30-50% of the raw data size.

## 5. Voice Filter Integration
Voice intents are mapped to SQL queries using a combination of FTS and B-Tree filters:
- *Voice*: "Show John's invoices" 
- *SQL*: `SELECT * FROM capture_items WHERE client_id IN (SELECT id FROM clients WHERE name MATCH 'John') AND type = 'invoice' ORDER BY created_at DESC;`

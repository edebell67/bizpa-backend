const db = require('../config/db');

/**
 * Pull Delta: Download changes from server
 * GET /api/v1/sync/pull?since=TIMESTAMP
 */
const pullDelta = async (req, res) => {
  const { since } = req.query;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000'; // Default for MVP

  try {
    const query = `SELECT * FROM get_delta_changes($1, $2)`;
    const result = await db.query(query, [userId, since || '1970-01-01']);

    res.json({
      timestamp: new Date().toISOString(),
      changes: result.rows
    });
  } catch (err) {
    console.error('[SyncController] pullDelta Error:', err);
    res.status(500).json({ error: 'Failed to pull delta changes' });
  }
};

/**
 * Push Delta: Upload local changes to server
 * POST /api/v1/sync/push
 * Payload: { changes: [{ table_name, entity_id, action, data }] }
 */
const pushDelta = async (req, res) => {
  const { changes } = req.body;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
  const deviceId = req.headers['x-device-id'] || 'unknown';

  if (!Array.isArray(changes)) {
    return res.status(400).json({ error: 'Invalid changes format' });
  }

  const results = [];

  try {
    // Start a transaction
    await db.query('BEGIN');

    for (const change of changes) {
      const { table_name, entity_id, action, data } = change;

      try {
        if (action === 'upsert') {
          // Dynamic upsert logic (simplified for prototype)
          // In production, use specific handlers per table to validate data
          const columns = Object.keys(data).filter(col => col !== 'id' && col !== 'user_id' && col !== 'last_synced_at');
          const values = columns.map(col => data[col]);
          
          // Add user_id and id to values
          values.push(userId);
          values.push(entity_id);

          const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ');
          const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
          
          const upsertQuery = `
            INSERT INTO ${table_name} (${columns.join(', ')}, user_id, id)
            VALUES (${placeholders}, $${columns.length + 1}, $${columns.length + 2})
            ON CONFLICT (id) DO UPDATE SET ${setClause}, user_id = EXCLUDED.user_id, updated_at = CURRENT_TIMESTAMP, last_synced_at = CURRENT_TIMESTAMP
            RETURNING id
          `;
          
          await db.query(upsertQuery, values);
          results.push({ entity_id, status: 'success' });
        } else if (action === 'delete') {
          const deleteQuery = `
            UPDATE ${table_name} SET deleted_at = CURRENT_TIMESTAMP, last_synced_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
          `;
          await db.query(deleteQuery, [entity_id, userId]);
          results.push({ entity_id, status: 'success' });
        }
      } catch (err) {
        console.error(`[SyncController] Error processing change for ${table_name}:${entity_id}`, err);
        results.push({ entity_id, status: 'error', message: err.message });
      }
    }

    await db.query('COMMIT');
    res.json({ results });

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('[SyncController] pushDelta Error:', err);
    res.status(500).json({ error: 'Failed to push delta changes' });
  }
};

module.exports = {
  pullDelta,
  pushDelta
};

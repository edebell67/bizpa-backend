const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
  try {
    const eventsQuery = `
      SELECT 'event' as source, id, title as description, start_at as date, event_type as type
      FROM calendar_events
      WHERE start_at >= CURRENT_DATE AND user_id = $1 AND deleted_at IS NULL
      UNION ALL
      SELECT 'item' as source, id, extracted_text as description, due_date as date, type
      FROM capture_items
      WHERE due_date >= CURRENT_DATE AND user_id = $1 AND deleted_at IS NULL
      ORDER BY date ASC
    `;
    const result = await db.query(eventsQuery, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('[UpcomingRoute] Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/notifications', async (req, res) => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
  try {
    const notifyQuery = `
      -- Upcoming calendar events (Next 24 hours)
      SELECT 'event' as source, id, title as description, start_at as date, event_type as type, 'high' as priority
      FROM calendar_events
      WHERE start_at >= NOW() AND start_at <= NOW() + INTERVAL '24 hours'
      AND user_id = $1 AND deleted_at IS NULL
      
      UNION ALL
      
      -- Overdue items (Past due_date, not confirmed)
      SELECT 'item' as source, id, extracted_text as description, due_date as date, type, 'urgent' as priority
      FROM capture_items
      WHERE due_date < CURRENT_DATE AND status != 'confirmed' AND status != 'archived'
      AND user_id = $1 AND deleted_at IS NULL
      
      UNION ALL
      
      -- Expiring quotes (Next 72 hours)
      SELECT 'item' as source, id, extracted_text as description, due_date as date, type, 'medium' as priority
      FROM capture_items
      WHERE due_date >= CURRENT_DATE AND due_date <= CURRENT_DATE + INTERVAL '3 days' 
      AND type = 'quote' AND status != 'confirmed' AND status != 'archived'
      AND user_id = $1 AND deleted_at IS NULL
      
      ORDER BY date ASC
    `;
    const result = await db.query(notifyQuery, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('[NotificationRoute] Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

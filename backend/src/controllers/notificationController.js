const db = require('../config/db');

/**
 * Get active notifications for a user
 * GET /api/v1/notifications
 */
const getNotifications = async (req, res) => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
  const { limit = 5 } = req.query;

  try {
    const query = `
      SELECT * FROM notification_events 
      WHERE user_id = $1 AND is_dismissed = FALSE
      ORDER BY priority = 'critical' DESC, priority = 'important' DESC, created_at DESC
      LIMIT $2
    `;
    const result = await db.query(query, [userId, limit]);
    res.json(result.rows);
  } catch (err) {
    console.error('[NotificationController] getNotifications Error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Dismiss a notification
 * POST /api/v1/notifications/:id/dismiss
 */
const dismissNotification = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

  try {
    const result = await db.query(
      'UPDATE notification_events SET is_dismissed = TRUE, dismissed_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification dismissed', id: result.rows[0].id });
  } catch (err) {
    console.error('[NotificationController] dismissNotification Error:', err);
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
};

module.exports = {
  getNotifications,
  dismissNotification
};

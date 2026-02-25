const db = require('../config/db');

/**
 * RBAC Middleware: Ensure user has required role in a specific team.
 * Usage: router.post('/:teamId/members', checkRole(['admin']), teamController.addMember);
 */
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    const userId = req.user?.id;
    const { teamId } = req.params;

    if (!teamId) return res.status(400).json({ error: 'teamId is required for RBAC check' });

    try {
      const query = 'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2';
      const result = await db.query(query, [teamId, userId]);

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied: Not a team member' });
      }

      const userRole = result.rows[0].role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: `Access denied: Role ${userRole} not authorized` });
      }

      next();
    } catch (err) {
      console.error('[RBACMiddleware] Error:', err);
      res.status(500).json({ error: 'Internal Server Error during authorization' });
    }
  };
};

module.exports = { checkRole };

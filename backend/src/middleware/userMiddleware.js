const jwt = require('jsonwebtoken');

/**
 * JWT Verification Middleware.
 * Extracts and verifies token from 'Authorization' header.
 */
const userMiddleware = (req, res, next) => {
  // Allow public access to login
  if (req.path === '/api/v1/auth/login' || req.path === '/api/health') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Fallback to default user for local/prototype testing if NO token provided
    // In strict production mode, this would return 401
    const userId = req.headers['x-user-id'] || '00000000-0000-0000-0000-000000000000';
    req.user = { id: userId };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bizpa_voice_secret_2026');
    req.user = decoded;
    next();
  } catch (err) {
    console.warn('[Auth] Invalid Token:', err.message);
    return res.status(403).json({ error: 'Invalid or expired session token' });
  }
};

module.exports = userMiddleware;

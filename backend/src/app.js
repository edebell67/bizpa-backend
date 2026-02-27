const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./config/db');
require('dotenv').config();

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const itemRoutes = require('./routes/itemRoutes');
const actionRoutes = require('./routes/actionRoutes');
const searchRoutes = require('./routes/searchRoutes');
const upcomingRoutes = require('./routes/upcomingRoutes');
const statsRoutes = require('./routes/statsRoutes');
const vatRoutes = require('./routes/vatRoutes');
const insightRoutes = require('./routes/insightRoutes');
const syncRoutes = require('./routes/syncRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const exportRoutes = require('./routes/exportRoutes');
const clientRoutes = require('./routes/clientRoutes');
const jobRoutes = require('./routes/jobRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const teamRoutes = require('./routes/teamRoutes');

// Import DB for background tasks

// Middleware
const userMiddleware = require('./middleware/userMiddleware');

// Custom Network Logger
app.use((req, res, next) => {
  console.log(`[NETWORK] ${new Date().toISOString()} | ${req.method} ${req.url} | From: ${req.ip}`);
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(userMiddleware);
app.use('/uploads', express.static('uploads'));

// Bind Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/voice', voiceRoutes);
app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/action', actionRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/upcoming', upcomingRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/tax', vatRoutes);
app.use('/api/v1/insights', insightRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/revenue', revenueRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/diary', diaryRoutes);
app.use('/api/v1/teams', teamRoutes);

// Background Maintenance
const itemController = require('./controllers/itemController');
setInterval(async () => {
  try {
    // 1. Update statuses
    await db.query('SELECT update_overdue_statuses()');
    
    // 2. Trigger notifications
    await db.query('SELECT check_and_trigger_overdue_notifications()');
    
    // 3. Check milestones for default user
    await db.query("SELECT check_revenue_milestones('00000000-0000-0000-0000-000000000000')");

    console.log('[Maintenance] Lifecycle checks completed.');
  } catch (err) {
    console.error('[Maintenance] Error during background checks:', err);
  }
}, 3600000); // Every hour

// Health Check
app.get('/api/health', (req, res) => {
  const supabase = require('./config/supabase');
  res.status(200).json({
    status: 'UP',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cloud_storage: supabase ? 'connected' : 'disconnected'
  });
});

// 404 Wildcard Handler
app.use((req, res, next) => {
  console.log(`[404] No route matched for: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    path: req.url,
    method: req.method
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] bizPA Backend running on port ${PORT} (Listening on 0.0.0.0)`);
  });
}

module.exports = app;

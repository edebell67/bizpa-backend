const db = require('./src/config/db');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

async function fixDb() {
  console.log('--- Database Initialization Fix ---');
  try {
    // 1. Check if default user exists
    const userRes = await db.query('SELECT id FROM users WHERE id = $1', [DEFAULT_USER_ID]);
    
    if (userRes.rows.length === 0) {
      console.log(`[INIT] Default user ${DEFAULT_USER_ID} missing. Creating...`);
      await db.query(`
        INSERT INTO users (id, email, full_name, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [DEFAULT_USER_ID, 'default@bizpa.local', 'Default User']);
      console.log('[PASS] Default user created.');
    } else {
      console.log('[INFO] Default user already exists.');
    }

    // 2. Ensure tenant_config exists for default user
    const configRes = await db.query('SELECT user_id FROM tenant_config WHERE user_id = $1', [DEFAULT_USER_ID]);
    if (configRes.rows.length === 0) {
      console.log('[INIT] Tenant config missing for default user. Creating...');
      await db.query('INSERT INTO tenant_config (user_id) VALUES ($1)', [DEFAULT_USER_ID]);
      console.log('[PASS] Tenant config created.');
    } else {
      console.log('[INFO] Tenant config already exists.');
    }

    console.log('--- DB Fix Completed ---');
    process.exit(0);
  } catch (err) {
    console.error('[FAIL] DB Fix error:', err);
    process.exit(1);
  }
}

fixDb();

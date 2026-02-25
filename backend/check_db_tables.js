const { Pool } = require('pg');
require('dotenv').config({ path: 'C:/Users/edebe/eds/bizPA/backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDB() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in database:');
    res.rows.forEach(row => console.log(` - ${row.table_name}`));
    await pool.end();
  } catch (err) {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  }
}

checkDB();

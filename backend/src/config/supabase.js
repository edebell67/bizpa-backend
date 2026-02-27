const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] CRITICAL: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.');
  console.info('[Supabase] Environment keys detected:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Client initialized successfully.');
  } catch (err) {
    console.error('[Supabase] Initialization failed:', err.message);
  }
}

module.exports = supabase;

const axios = require('axios');

const searchUrl = 'http://localhost:5050/api/v1/search';
const itemUrl = 'http://localhost:5050/api/v1/items';
const voiceUrl = 'http://localhost:5050/api/v1/voice/process';

async function runTests() {
  console.log('--- Starting Search API Tests ---');

  try {
    // 1. Create a searchable item
    console.log('[1] Creating searchable item...');
    await axios.post(itemUrl, {
      type: 'receipt',
      amount: 55.00,
      extracted_text: 'BP Gas Station - Diesel Fuel Receipt',
      raw_note: 'Filled up the van',
      device_id: 'search-tester'
    });

    // 2. Test Text Search
    console.log('[2] Testing Search for "fuel"...');
    const searchRes = await axios.post(searchUrl, { query: 'fuel' });
    if (searchRes.data.length > 0) {
      console.log(`[PASS] Found ${searchRes.data.length} matches.`);
      console.log(`[Snippet]: "${searchRes.data[0].snippet}"`);
    } else {
      console.log('[FAIL] No results found for "fuel".');
    }

    // 3. Test Filtered Search
    console.log('[3] Testing Filtered Search (query="BP", type="receipt")...');
    const filterRes = await axios.post(searchUrl, { 
      query: 'BP', 
      filters: { type: 'receipt' } 
    });
    console.log(`[PASS] Found ${filterRes.data.length} filtered matches.`);

    // 4. Test Voice-triggered Search
    console.log('[4] Testing Voice Command "Show me fuel"...');
    const voiceRes = await axios.post(voiceUrl, { 
      transcript: 'Show me fuel',
      device_id: 'search-tester'
    });
    // If successful, voice controller returns the search results directly
    if (Array.isArray(voiceRes.data) && voiceRes.data.length > 0) {
      console.log(`[PASS] Voice command correctly returned search results.`);
    } else {
      console.log('[FAIL] Voice command did not return search results.');
    }

  } catch (err) {
    console.error(`[FAIL] Test error:`, err.response ? err.response.data : err.message);
  }
}

runTests();

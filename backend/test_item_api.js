const axios = require('axios');

const baseUrl = 'http://localhost:5050/api/v1/items';
let createdItemId = null;

async function runTests() {
  console.log('--- Starting Item API Tests ---');

  try {
    // 1. Create Item
    console.log('[1] Testing Create Item...');
    const createRes = await axios.post(baseUrl, {
      type: 'receipt',
      amount: 42.10,
      raw_note: 'Fuel for van',
      device_id: 'test-device-001',
      labels: ['fuel', 'materials']
    });
    createdItemId = createRes.data.id;
    console.log(`[PASS] Created Item ID: ${createdItemId}`);

    // 2. List Items
    console.log('[2] Testing List Items (Filter: type=receipt)...');
    const listRes = await axios.get(`${baseUrl}?type=receipt`);
    const found = listRes.data.some(item => item.id === createdItemId);
    console.log(`[PASS] Item found in list: ${found}`);

    // 3. Update Item (PATCH)
    console.log('[3] Testing Update Item (Link to status=confirmed)...');
    const updateRes = await axios.patch(`${baseUrl}/${createdItemId}`, {
      status: 'confirmed',
      labels: ['fuel', 'business']
    });
    console.log(`[PASS] Item status updated to: ${updateRes.data.status}`);

    // 4. Archive Item (DELETE)
    console.log('[4] Testing Archive Item (DELETE)...');
    const deleteRes = await axios.delete(`${baseUrl}/${createdItemId}`);
    console.log(`[PASS] Archive response: ${deleteRes.data.message}`);

    // 5. Verify Archived status
    console.log('[5] Verifying item is excluded from normal list...');
    const finalRes = await axios.get(baseUrl);
    const stillExists = finalRes.data.some(item => item.id === createdItemId);
    console.log(`[PASS] Item excluded from default list: ${!stillExists}`);

  } catch (err) {
    console.error(`[FAIL] Test error:`, err.response ? err.response.data : err.message);
  }
}

runTests();

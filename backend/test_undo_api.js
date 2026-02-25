const axios = require('axios');

const itemUrl = 'http://localhost:5050/api/v1/items';
const undoUrl = 'http://localhost:5050/api/v1/action/undo';
const device_id = 'test-device-undo';

async function runTests() {
  console.log('--- Starting Undo API Tests ---');

  try {
    // 1. Test Undo Create
    console.log('[1] Testing Undo Create...');
    const createRes = await axios.post(itemUrl, {
      type: 'note',
      raw_note: 'Undo me',
      device_id
    });
    const itemId = createRes.data.id;
    console.log(`Created Item: ${itemId}`);

    const undoCreateRes = await axios.post(undoUrl, { device_id });
    console.log(`Undo Response: ${undoCreateRes.data.message}`);

    try {
      await axios.get(`${itemUrl}/${itemId}`);
      console.log('[FAIL] Item still exists after undo create');
    } catch (e) {
      console.log('[PASS] Item successfully deleted after undo create');
    }

    // 2. Test Undo Update
    console.log('[2] Testing Undo Update...');
    const item2 = await axios.post(itemUrl, {
      type: 'receipt',
      amount: 10.0,
      device_id
    });
    const item2Id = item2.data.id;

    await axios.patch(`${itemUrl}/${item2Id}`, { amount: 99.99 });
    console.log('Updated amount to 99.99');

    await axios.post(undoUrl, { device_id });
    console.log('Undo performed');

    const revertedItem = await axios.get(`${itemUrl}/${item2Id}`);
    console.log(`Reverted amount: ${revertedItem.data.amount}`);
    if (parseFloat(revertedItem.data.amount) === 10.0) {
      console.log('[PASS] Amount successfully reverted to 10.0');
    } else {
      console.log('[FAIL] Amount not reverted correctly');
    }

    // 3. Test Undo Delete (Soft Delete)
    console.log('[3] Testing Undo Archive...');
    await axios.delete(`${itemUrl}/${item2Id}`);
    console.log('Item archived');

    await axios.post(undoUrl, { device_id });
    console.log('Undo performed');

    const restoredItem = await axios.get(`${itemUrl}/${item2Id}`);
    console.log(`Restored status: ${restoredItem.data.status}`);
    if (restoredItem.data.status !== 'archived') {
      console.log('[PASS] Status successfully restored from archived');
    } else {
      console.log('[FAIL] Status still archived');
    }

  } catch (err) {
    console.error(`[FAIL] Test error:`, err.response ? err.response.data : err.message);
  }
}

runTests();

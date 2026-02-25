const axios = require('axios');

const baseUrl = 'http://localhost:5055/api/v1';
const userId = '00000000-0000-0000-0000-000000000000';

const config = {
  headers: { 'X-User-ID': userId }
};

async function runCalendarDiaryTests() {
  console.log('--- bizPA Milestone 3 Calendar & Diary Verification ---');
  let eventId = '';
  let diaryId = '';

  try {
    // 1. Create Calendar Event
    console.log('[Test 1]: Create Calendar Event');
    const eventRes = await axios.post(`${baseUrl}/calendar`, {
      title: 'Site Visit: Tom',
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 3600000).toISOString(),
      event_type: 'meeting'
    }, config);
    eventId = eventRes.data.id;
    console.log(`   PASS: Created event ${eventId}`);

    // 2. Create Diary Entry
    console.log('[Test 2]: Create Diary Entry');
    const diaryRes = await axios.post(`${baseUrl}/diary`, {
      entry_date: new Date().toISOString().split('T')[0],
      content: 'Met with Tom today. He needs a new quote for the kitchen.'
    }, config);
    diaryId = diaryRes.data.id;
    console.log(`   PASS: Created diary entry ${diaryId}`);

    // 3. List Events
    console.log('[Test 3]: List Calendar Events');
    const eventsList = await axios.get(`${baseUrl}/calendar`, config);
    if (eventsList.data.some(e => e.id === eventId)) {
      console.log('   PASS: Event found in list');
    } else {
      throw new Error('Event not found in list');
    }

    // 4. List Diary Entries
    console.log('[Test 4]: List Diary Entries');
    const diaryList = await axios.get(`${baseUrl}/diary`, config);
    if (diaryList.data.some(d => d.id === diaryId)) {
      console.log('   PASS: Diary entry found in list');
    } else {
      throw new Error('Diary entry not found in list');
    }

    // 5. Cleanup
    console.log('[Test 5]: Cleanup');
    await axios.delete(`${baseUrl}/calendar/${eventId}`, config);
    await axios.delete(`${baseUrl}/diary/${diaryId}`, config);
    console.log('   PASS: Cleaned up test data');

    console.log('--- FINAL RESULT: ALL CALENDAR & DIARY TESTS PASSED ---');
  } catch (err) {
    console.error('--- TESTS FAILED ---');
    if (err.response) {
      console.error(`   Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(`   Error: ${err.message}`);
    }
    process.exit(1);
  }
}

runCalendarDiaryTests();

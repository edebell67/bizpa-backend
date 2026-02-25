const axios = require('axios');

const baseUrl = 'http://localhost:5055/api/v1';
const userId = '00000000-0000-0000-0000-000000000000';

const config = {
  headers: { 'X-User-ID': userId }
};

async function runSyncTeamTests() {
  console.log('--- bizPA Milestone 3 Sync & Team Verification ---');
  let teamId = '';

  try {
    // 1. Create Team
    console.log('[Test 1]: Create Team');
    const teamRes = await axios.post(`${baseUrl}/teams`, {
      name: 'Alpha Construction'
    }, config);
    teamId = teamRes.data.id;
    console.log(`   PASS: Created team ${teamId}`);

    // 2. List My Teams
    console.log('[Test 2]: List My Teams');
    const myTeams = await axios.get(`${baseUrl}/teams/my`, config);
    if (myTeams.data.some(t => t.id === teamId)) {
      console.log('   PASS: Team found in my list');
    } else {
      throw new Error('Team not found in my list');
    }

    // 3. Pull Delta
    console.log('[Test 3]: Pull Delta Sync');
    const pullRes = await axios.get(`${baseUrl}/sync/pull?since=2026-01-01`, config);
    console.log(`   PASS: Received ${pullRes.data.changes.length} changes since 2026-01-01`);

    // 4. Push Delta (Conceptual Item)
    console.log('[Test 4]: Push Delta (Sync Item)');
    const pushRes = await axios.post(`${baseUrl}/sync/push`, {
      changes: [
        {
          table_name: 'capture_items',
          entity_id: '00000000-0000-0000-0000-000000000999', // Pseudo ID
          action: 'upsert',
          data: {
            type: 'note',
            status: 'draft',
            raw_note: 'Synced note from test script',
            device_id: 'test-sync-script'
          }
        }
      ]
    }, config);
    if (pushRes.data.results[0].status === 'success') {
      console.log('   PASS: Item pushed successfully');
    } else {
      throw new Error('Push failed: ' + JSON.stringify(pushRes.data.results[0]));
    }

    console.log('--- FINAL RESULT: ALL SYNC & TEAM TESTS PASSED ---');
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

runSyncTeamTests();

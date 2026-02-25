const axios = require('axios');

const baseUrl = 'http://localhost:5055/api/v1';
const userId = '00000000-0000-0000-0000-000000000000';

const config = {
  headers: { 'X-User-ID': userId }
};

async function runCRMTests() {
  console.log('--- bizPA Milestone 2 CRM Verification ---');
  let clientId = '';
  let jobId = '';

  try {
    // 1. Create Client
    console.log('[Test 1]: Create Client');
    const clientRes = await axios.post(`${baseUrl}/clients`, {
      name: 'Test Client Ltd',
      email: 'test@client.com',
      phone: '0123456789'
    }, config);
    clientId = clientRes.data.id;
    console.log(`   PASS: Created client ${clientId}`);

    // 2. Create Job
    console.log('[Test 2]: Create Job');
    const jobRes = await axios.post(`${baseUrl}/jobs`, {
      client_id: clientId,
      service_category: 'Consulting',
      status: 'lead',
      value_estimate: 1500
    }, config);
    jobId = jobRes.data.id;
    console.log(`   PASS: Created job ${jobId}`);

    // 3. List Jobs
    console.log('[Test 3]: List Jobs');
    const listRes = await axios.get(`${baseUrl}/jobs`, config);
    const jobFound = listRes.data.find(j => j.id === jobId);
    if (jobFound && jobFound.client_name === 'Test Client Ltd') {
      console.log('   PASS: Job found in list with correct client name');
    } else {
      throw new Error('Job not found or client name mismatch');
    }

    // 4. Update Job
    console.log('[Test 4]: Update Job Status');
    const updateRes = await axios.patch(`${baseUrl}/jobs/${jobId}`, {
      status: 'booked',
      value_estimate: 2000
    }, config);
    if (updateRes.data.status === 'booked' && parseFloat(updateRes.data.value_estimate) === 2000) {
      console.log('   PASS: Job updated successfully');
    } else {
      throw new Error('Update values mismatch');
    }

    // 5. Delete Job
    console.log('[Test 5]: Delete Job');
    const delRes = await axios.delete(`${baseUrl}/jobs/${jobId}`, config);
    console.log(`   PASS: ${delRes.data.message}`);

    // 6. Cleanup Client
    console.log('[Test 6]: Cleanup Client');
    await axios.delete(`${baseUrl}/clients/${clientId}`, config);
    console.log('   PASS: Client deleted');

    console.log('--- FINAL RESULT: ALL CRM TESTS PASSED ---');
  } catch (err) {
    console.error('--- CRM TESTS FAILED ---');
    if (err.response) {
      console.error(`   Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(`   Error: ${err.message}`);
    }
    process.exit(1);
  }
}

runCRMTests();

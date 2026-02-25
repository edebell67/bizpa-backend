const axios = require('axios');

const baseUrl = 'http://localhost:5055/api/v1';
const userId = '00000000-0000-0000-0000-000000000000';

const config = {
  headers: { 'X-User-ID': userId }
};

async function testRevenue() {
  console.log('--- bizPA Revenue Engine Test ---');
  try {
    const res = await axios.get(`${baseUrl}/revenue/followups`, config);
    console.log('   PASS: Follow-ups:', JSON.stringify(res.data));
  } catch (err) {
    if (err.response) {
      console.error(`   FAIL: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(`   FAIL: ${err.message}`);
    }
  }
}

testRevenue();

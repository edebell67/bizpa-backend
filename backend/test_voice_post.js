const axios = require('axios');

async function testVoice() {
  const url = 'http://localhost:5055/api/v1/voice/process';
  const data = {
    transcript: "Spent £50 on fuel today",
    device_id: "test-node-script"
  };

  try {
    const res = await axios.post(url, data);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testVoice();

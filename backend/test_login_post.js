const axios = require('axios');

async function testLogin() {
  const url = 'http://localhost:5055/api/v1/auth/login';
  const data = {
    email: "default@bizpa.local"
  };

  try {
    const res = await axios.post(url, data);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testLogin();

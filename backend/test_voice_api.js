const axios = require('axios');

const baseUrl = 'http://localhost:5051/api/v1/voice/process';

const testCases = [
  { name: 'Full Intent', transcript: 'Capture receipt £42.10 for Fuel', expected: 'capture_receipt', status: 'execute' },
  { name: 'Missing Amount (Clarify)', transcript: 'Capture receipt for Fuel', expected: 'capture_receipt', status: 'clarification_needed' },
  { name: 'Follow-up Amount', transcript: '50 pounds', expected: 'capture_receipt', status: 'execute' },
  { name: 'Missing Amount for Payment', transcript: 'Record payment from John Smith', expected: 'capture_payment', status: 'clarification_needed' },
  { name: 'Skip Clarification', transcript: 'Skip', expected: 'capture_payment', status: 'execute' },
  { name: 'Summary', transcript: 'Summarise today', expected: 'summarise_today', status: 'execute' },
  { name: 'Repeat', transcript: 'Repeat please', expected: 'repeat_last', status: 'execute' },
  { name: 'Undo', transcript: 'Undo last action', expected: 'undo_last_action', status: 'execute' }
];

async function runTests() {
  console.log('--- Starting Voice API Tests ---');
  for (const test of testCases) {
    try {
      const response = await axios.post(baseUrl, {
        transcript: test.transcript,
        device_id: 'test-device-multi-turn'
      });
      const data = response.data;
      console.log(`[Test]: ${test.name}`);
      console.log(`[Transcript]: "${test.transcript}"`);
      console.log(`[Result]: Intent="${data.intent}", Slots=${JSON.stringify(data.slots)}, Confidence=${data.confidence}`);
      console.log(`[TTS]: "${data.confirmation_text}"`);
      
      const passIntent = data.intent === test.expected || (test.expected === 'undo_last_action' && data.message);
      const passStatus = data.action_status === test.status;
      
      console.log(`[Status]: ${passIntent && passStatus ? 'PASS' : 'FAIL'}`);
      console.log('---');
    } catch (err) {
      if (err.response) {
        console.error(`[Error] ${test.transcript}: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else {
        console.error(`[Error] ${test.transcript}: ${err.message}`);
      }
    }
  }
}

runTests();

import { POST } from '../app/api/chat/route';
import { NextRequest } from 'next/server';

async function runTest() {
  console.log('Running test for AI failure scenario...');

  // Create a mock request object that mimics a real API call.
  const request = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          messages: [{ role: 'user', content: 'Tell me about your skills' }],
      }),
  });

  // Directly invoke the exported POST handler.
  const response = await POST(request);
  const data = await response.json();

  // Assert that the response contains the specific error message we implemented.
  const expectedReply = 'Hugging Face API call failed. This is likely due to a missing or invalid HUGGINGFACE_API_KEY environment variable. Please check your .env file.';
  if (data.reply !== expectedReply) {
    console.error(`FAIL: Expected reply to be "${expectedReply}", but got "${data.reply}"`);
    process.exit(1);
  }

  console.log('PASS: The API correctly returns the error message on AI failure.');
}

runTest().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});

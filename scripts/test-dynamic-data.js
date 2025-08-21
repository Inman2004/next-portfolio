// Test script for dynamic data loading
// Run with: node scripts/test-dynamic-data.js

const BASE_URL = 'http://localhost:3000';

async function testDynamicData() {
  console.log('🧪 Testing Dynamic Data Loading System\n');

  try {
    // 1. Test current data freshness
    console.log('1️⃣ Checking current data freshness...');
    const freshnessResponse = await fetch(`${BASE_URL}/api/refresh-data`);
    const freshnessData = await freshnessResponse.json();
    console.log('📊 Data Freshness:', JSON.stringify(freshnessData, null, 2));

    // 2. Test manual refresh
    console.log('\n2️⃣ Triggering manual data refresh...');
    const refreshResponse = await fetch(`${BASE_URL}/api/refresh-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh' })
    });
    const refreshData = await refreshResponse.json();
    console.log('🔄 Refresh Result:', JSON.stringify(refreshData, null, 2));

    // 3. Test chatbot with fresh data
    console.log('\n3️⃣ Testing chatbot with fresh data...');
    const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is your latest project?' })
    });
    
    // Check headers for data freshness info
    const dataFreshnessHeader = chatResponse.headers.get('X-Data-Freshness');
    console.log('📅 Data Freshness Header:', dataFreshnessHeader);
    
    const chatData = await chatResponse.json();
    console.log('💬 Chat Response:', chatData.reply);

    // 4. Test data freshness again
    console.log('\n4️⃣ Checking data freshness after refresh...');
    const finalFreshnessResponse = await fetch(`${BASE_URL}/api/refresh-data`);
    const finalFreshnessData = await finalFreshnessResponse.json();
    console.log('📊 Final Data Freshness:', JSON.stringify(finalFreshnessData, null, 2));

  } catch (error) {
    console.error('❌ Error testing dynamic data:', error.message);
  }
}

// Run the test
testDynamicData();

// Use require for CommonJS compatibility
const { getViewCounts } = require('../lib/views');

async function testViewCounts() {
  try {
    // Test with some post IDs (replace with actual post IDs from your database)
    const postIds = ['post1', 'post2', 'post3'];
    console.log('Fetching view counts for post IDs:', postIds);
    
    const counts = await getViewCounts(postIds);
    console.log('View counts:', counts);
    
    // Verify that all post IDs have a count (should be 0 or a number)
    postIds.forEach(postId => {
      console.log(`Post ${postId}: ${counts[postId] || 0} views`);
    });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error testing view counts:', error);
  } finally {
    process.exit(0);
  }
}

testViewCounts();

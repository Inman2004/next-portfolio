import { getViewCounts } from './views';

async function testViewCounts() {
  console.log('Starting testViewCounts...');
  
  try {
    // Test with some post IDs (replace with actual post IDs from your database)
    const postIds = ['post1', 'post2', 'post3'];
    console.log('Fetching view counts for post IDs:', postIds);
    
    console.log('Calling getViewCounts...');
    const counts = await getViewCounts(postIds);
    console.log('Received view counts:', counts);
    
    if (!counts) {
      console.error('Error: getViewCounts returned undefined or null');
      return;
    }
    
    // Verify that all post IDs have a count (should be 0 or a number)
    console.log('Verifying results...');
    postIds.forEach(postId => {
      console.log(`Post ${postId}: ${counts[postId] !== undefined ? counts[postId] : 'undefined'} views`);
    });
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error in testViewCounts:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  } finally {
    console.log('Test finished');
  }
}

// Run the test
console.log('Starting test...');
testViewCounts()
  .then(() => console.log('Test promise resolved'))
  .catch(err => console.error('Unhandled promise rejection:', err));

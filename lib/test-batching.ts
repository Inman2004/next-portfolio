import 'server-only';
import { batchQuery, batchQueryAsMap } from './firebase-utils';

/**
 * Test function to verify batching works correctly
 * This simulates what would happen with large arrays
 */
export async function testBatching() {
  console.log('Testing batching utility...');
  
  // Create an array with 100 fake IDs (more than the 30 limit)
  const testIds = Array.from({ length: 100 }, (_, i) => `test-id-${i + 1}`);
  
  try {
    // Test the basic batch query (this will fail in Firestore but should handle gracefully)
    console.log(`Testing with ${testIds.length} IDs...`);
    
    // This would normally fail with Firestore IN operator limit
    // But our batching utility should handle it
    const results = await batchQuery(
      'testCollection',
      'testField',
      testIds
    );
    
    console.log(`Batch query completed successfully. Results: ${results.length}`);
    return true;
    
  } catch (error) {
    console.error('Batching test failed:', error);
    return false;
  }
}

/**
 * Test the Map version of batching
 */
export async function testBatchingAsMap() {
  console.log('Testing batching utility with Map output...');
  
  const testIds = Array.from({ length: 75 }, (_, i) => `test-id-${i + 1}`);
  
  try {
    const resultMap = await batchQueryAsMap(
      'testCollection',
      'testField',
      testIds
    );
    
    console.log(`Batch query as Map completed successfully. Map size: ${resultMap.size}`);
    return true;
    
  } catch (error) {
    console.error('Batching as Map test failed:', error);
    return false;
  }
}

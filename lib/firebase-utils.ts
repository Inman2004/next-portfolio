import 'server-only';
import { collection, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase-server';

/**
 * Utility function to batch Firestore queries that use the 'in' operator
 * Firestore has a limit of 30 values for 'in' queries
 */
export async function batchQuery<T = any>(
  collectionName: string,
  field: string,
  values: string[],
  additionalConstraints: QueryConstraint[] = []
): Promise<T[]> {
  if (!values.length) return [];
  
  const results: T[] = [];
  const BATCH_SIZE = 30; // Firestore limit for 'in' operator
  
  console.log(`Processing ${values.length} values for ${collectionName}.${field} in ${Math.ceil(values.length / BATCH_SIZE)} batches`);
  
  // Process in batches
  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const batch = values.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    
    if (batch.length === 0) continue;
    
    try {
      console.log(`Processing batch ${batchNumber}/${Math.ceil(values.length / BATCH_SIZE)} with ${batch.length} items`);
      
      const q = query(
        collection(db, collectionName),
        where(field, 'in', batch),
        ...additionalConstraints
      );
      
      const snapshot = await getDocs(q);
      console.log(`Batch ${batchNumber} returned ${snapshot.size} documents`);
      
      snapshot.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as T);
      });
    } catch (batchError) {
      console.error(`Error processing batch ${batchNumber} for ${collectionName}.${field}:`, batchError);
      console.error(`Batch values:`, batch);
      // Continue with next batch instead of failing completely
    }
  }
  
  console.log(`Total results returned: ${results.length}`);
  return results;
}

/**
 * Utility function to batch query and return results as a Map
 * Useful when you need to maintain the relationship between IDs and data
 */
export async function batchQueryAsMap<T = any>(
  collectionName: string,
  field: string,
  values: string[],
  additionalConstraints: QueryConstraint[] = []
): Promise<Map<string, T>> {
  const results = await batchQuery<T>(collectionName, field, values, additionalConstraints);
  const resultMap = new Map<string, T>();
  
  results.forEach((item: any) => {
    if (item.id) {
      resultMap.set(item.id, item);
    }
  });
  
  return resultMap;
}

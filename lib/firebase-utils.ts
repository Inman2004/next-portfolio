import 'server-only';
import { db } from './firebase-server';
import { FieldPath } from 'firebase-admin/firestore';

/**
 * Utility function to batch Firestore queries that use the 'in' operator.
 * Firestore has a limit of 30 values for 'in' queries.
 * This version uses the Firebase Admin SDK.
 */
export async function batchQuery<T = any>(
  collectionName: string,
  field: string | FieldPath,
  values: string[]
): Promise<T[]> {
  if (!values.length) return [];

  const results: T[] = [];
  const BATCH_SIZE = 30;

  console.log(`Processing ${values.length} values for ${collectionName}.${String(field)} in ${Math.ceil(values.length / BATCH_SIZE)} batches`);

  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const batch = values.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    if (batch.length === 0) continue;

    try {
      console.log(`Processing batch ${batchNumber}/${Math.ceil(values.length / BATCH_SIZE)} with ${batch.length} items`);

      const q = db.collection(collectionName).where(field, 'in', batch);
      const snapshot = await q.get();
      console.log(`Batch ${batchNumber} returned ${snapshot.size} documents`);

      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() } as T);
      });
    } catch (batchError) {
      console.error(`Error processing batch ${batchNumber} for ${collectionName}.${String(field)}:`, batchError);
      console.error(`Batch values:`, batch);
    }
  }

  console.log(`Total results returned: ${results.length}`);
  return results;
}

/**
 * Utility function to batch query and return results as a Map.
 * This version uses the Firebase Admin SDK.
 * @param field - The field to query on. Use '__name__' to query by document ID.
 */
export async function batchQueryAsMap<T = any>(
  collectionName: string,
  field: string,
  values: string[]
): Promise<Map<string, T>> {
  const queryField = field === '__name__' ? FieldPath.documentId() : field;
  const results = await batchQuery<T>(collectionName, queryField, values);
  const resultMap = new Map<string, T>();

  results.forEach((item: any) => {
    if (item.id) {
      resultMap.set(item.id, item);
    }
  });

  return resultMap;
}
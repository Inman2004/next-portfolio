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

  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const batch = values.slice(i, i + BATCH_SIZE);
    if (batch.length === 0) continue;

    try {
      const q = db.collection(collectionName).where(field, 'in', batch);
      const snapshot = await q.get();

      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() } as T);
      });
    } catch (batchError) {
      console.error(`Error processing batch for ${collectionName}.${String(field)}:`, batchError);
    }
  }
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
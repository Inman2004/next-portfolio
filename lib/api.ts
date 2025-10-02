import { ExperienceType } from '@/data/experiences';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Define the API response type
interface ApiResponse {
  success: boolean;
  data: ExperienceType[];
  debug?: {
    headers: [string, string][];
    status: number;
    sheetUrl: string;
  };
}

import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function fetchExperiences(): Promise<ExperienceType[]> {
  try {
    if (!db) {
      throw new Error("Firestore is not initialized");
    }
    
    const experiencesCollection = collection(db, 'experiences');
    const q = query(experiencesCollection, orderBy('id'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No experiences found in Firestore, falling back to local data.');
      const { experiences } = await import('@/data/experiences');
      return experiences;
    }

    const experiences = querySnapshot.docs.map(doc => doc.data() as ExperienceType);
    return experiences;

  } catch (error) {
    console.error('Error fetching experiences from Firestore:', error);
    // Fallback to local data if Firestore fails
    try {
      console.log('Falling back to local experiences data.');
      const { experiences } = await import('@/data/experiences');
      return experiences;
    } catch (e) {
      console.error('Failed to load fallback experiences:', e);
      return []; // Return empty array as a last resort
    }
  }
}

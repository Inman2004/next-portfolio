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

export async function fetchExperiences(): Promise<ExperienceType[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/experiences`, {
      next: { revalidate: 60 * 5 }, // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch experiences: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data; // Legacy format
    } else if (data && typeof data === 'object' && 'data' in data) {
      return data.data; // New format with data property
    } else if (data && typeof data === 'object' && 'experiences' in data) {
      return data.experiences; // Alternative format
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching experiences:', error);
    // Fallback to local data
    try {
      const { experiences } = await import('@/data/experiences');
      return experiences;
    } catch (e) {
      console.error('Failed to load fallback experiences:', e);
      return []; // Return empty array as last resort
    }
  }
}

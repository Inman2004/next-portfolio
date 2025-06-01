import { ExperienceType } from '@/data/experiences';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function fetchExperiences(): Promise<ExperienceType[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/experiences`, {
      next: { revalidate: 60 * 5 }, // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch experiences');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching experiences:', error);
    // Fallback to local data
    const { experiences } = await import('@/data/experiences');
    return experiences;
  }
}

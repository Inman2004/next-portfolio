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
    // First try to load from local data
    try {
      const { experiences } = await import('@/data/experiences');
      console.log('Using local experiences data');
      return experiences;
    } catch (e) {
      console.log('Local experiences not available, trying API');
    }
    
    // Fall back to API if local data is not available
    const response = await fetch(`${API_BASE_URL}/api/experiences`, {
      next: { revalidate: 60 * 5 }, // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch experiences: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different response formats and ensure all required fields are present
    const experiences = Array.isArray(data) 
      ? data 
      : data?.data || data?.experiences || [];
    
    // Ensure each experience has all required fields with defaults
    return experiences.map((exp: Partial<ExperienceType> & { [key: string]: any }) => ({
      id: exp.id || 0,
      role: exp.role || 'Unknown Role',
      company: exp.company || 'Unknown Company',
      companyUrl: exp.companyUrl || '',
      location: exp.location || 'Remote',
      startDate: exp.startDate || 'Present',
      endDate: exp.endDate || 'Present',
      description: Array.isArray(exp.description) ? exp.description : [],
      skills: Array.isArray(exp.skills) ? exp.skills : [],
      logo: exp.logo || '',
      status: exp.status || 'working' // Default status if not provided
    }));
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

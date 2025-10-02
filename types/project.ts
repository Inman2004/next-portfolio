export type ProjectStatus = 'active' | 'completed' | 'abandoned' | 'deployed' | 'outdated' | 'in-progress' | 'on-hold';

export interface Project {
  id: string; // Changed from title to id for better database management
  title: string;
  description: string;
  technologies: string[];
  github: string;
  live: string;
  documentation?: string;
  blogPost?: string;
  images: string[];
  videoPreviews?: {
    url: string;
    thumbnail: string;
    duration?: number;
  }[];
  startDate: string; // Changed to string to simplify data handling
  endDate: string; // Changed to string to simplify data handling
  status: ProjectStatus;
  content?: string;
}
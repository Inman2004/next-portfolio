import { Project as BaseProject } from '@/data/types';

export type ProjectStatus = 'active' | 'completed' | 'abandoned' | 'deployed' | 'outdated' | 'in-progress' | 'on-hold';

// Extended Project type that includes all possible fields
export interface Project extends Omit<BaseProject, 'status'> {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  live: string;
  documentation?: string;
  images: string[];
  startDate: Date | string;
  endDate: Date | string | 'Present';
  status: ProjectStatus;
  featured?: boolean;
  tags?: string[];
  githubUrl?: string;
  demoUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Helper type for creating/updating projects
export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  startDate?: string | Date;
  endDate?: string | Date | 'Present';
};

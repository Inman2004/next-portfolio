import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';
import { auth } from '@/lib/firebase';
import { Project, ProjectInput, ProjectStatus } from '../types';

// Helper function to create consistent JSON responses
const jsonResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Helper to verify the Firebase ID token
async function verifyToken(token: string) {
  console.log('API: Verifying token...');
  try {
    if (!token) {
      console.log('API: No token provided');
      return null;
    }
    
    // Remove 'Bearer ' prefix if present
    const idToken = token.replace(/^Bearer\s+/, '');
    console.log('API: Token after removing Bearer prefix:', idToken ? '***' : 'empty');
    
    // Verify token using Firebase client SDK
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: idToken
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API: Error verifying token:', data);
      return null;
    }
    
    const user = data.users?.[0];
    if (!user) {
      console.log('API: No user found for token');
      return null;
    }
    
    console.log('API: Verified user:', user.email);
    
    // Check if the user is the admin
    const isAdmin = user.email === 'rvimman@gmail.com';
    console.log(`API: Is admin (${user.email} === 'rvimman@gmail.com'):`, isAdmin);
    
    if (isAdmin) {
      console.log('API: Token verified successfully for admin user');
      return user;
    }
    
    console.log('API: User is not an admin');
    return null;
  } catch (error) {
    console.error('API: Error verifying token:', error);
    return null;
  }
}

// Singleton pattern for managing in-memory projects
class ProjectStore {
  private static instance: ProjectStore;
  private projects: Project[];

  private constructor() {
    this.projects = projects.map(project => ({
      ...project,
      id: (project as any).id || Math.random().toString(36).substring(2, 11),
      technologies: (project as any).technologies || [],
      images: (project as any).images || [],
      startDate: (project as any).startDate || new Date(),
      endDate: (project as any).endDate || 'Present',
      status: ((project as any).status as ProjectStatus) || 'active',
      createdAt: (project as any).createdAt || new Date(),
      updatedAt: (project as any).updatedAt || new Date(),
      githubUrl: (project as any).githubUrl,
      demoUrl: (project as any).demoUrl,
      tags: (project as any).tags,
      featured: (project as any).featured
    }));
  }

  public static getInstance(): ProjectStore {
    if (!ProjectStore.instance) {
      ProjectStore.instance = new ProjectStore();
    }
    return ProjectStore.instance;
  }

  public getProjects(): Project[] {
    return [...this.projects];
  }

  public setProjects(newProjects: Project[]): void {
    this.projects = newProjects.map(project => ({
      ...project,
      // Ensure all required fields are set
      id: project.id || Math.random().toString(36).substring(2, 11),
      title: project.title || 'Untitled Project',
      description: project.description || '',
      technologies: project.technologies || [],
      images: project.images || [],
      startDate: project.startDate || new Date(),
      endDate: project.endDate || 'Present',
      status: project.status || 'active',
      createdAt: project.createdAt || new Date(),
      updatedAt: project.updatedAt || new Date(),
    }));
  }
}

// Export a single instance of the store
export const projectStore = ProjectStore.getInstance();

// Helper function to save projects (in-memory for now)
export const saveProjects = (projectsData: Project[]) => {
  try {
    projectStore.setProjects(projectsData);
    return projectStore.getProjects();
  } catch (error) {
    console.error('Error saving projects:', error);
    throw error;
  }
};

// For backward compatibility
export const inMemoryProjects = projectStore.getProjects();

export async function GET(request: Request) {
  console.log('API: GET /api/admin/projects - Start');
  
  const jsonResponse = (data: any, status: number = 200) => {
    return NextResponse.json(data, {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
  
  try {
    // Verify the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('API: Authorization header:', authHeader ? '***' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('API: Missing or invalid authorization header');
      return jsonResponse(
        { 
          error: 'Missing or invalid authorization header',
          message: 'Please log in to access this resource'
        },
        401
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decodedToken = await verifyToken(token);
      if (!decodedToken) {
        console.log('API: Unauthorized - Invalid or expired token');
        return jsonResponse(
          { 
            error: 'Unauthorized',
            message: 'Your session has expired. Please log in again.'
          },
          401
        );
      }
      
      console.log('API: Successfully authenticated, returning projects');
      return jsonResponse(projectStore.getProjects());
    } catch (authError) {
      console.error('API: Authentication error:', authError);
      return jsonResponse(
        { 
          error: 'Authentication failed',
          message: 'Failed to verify your credentials. Please log in again.'
        },
        401
      );
    }
  } catch (error) {
    console.error('API: Error in GET /api/admin/projects:', error);
    return jsonResponse(
      { 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  } finally {
    console.log('API: GET /api/admin/projects - End');
  }
}

export async function POST(request: Request) {
  console.log('API: POST /api/admin/projects - Start');
  
  const jsonResponse = (data: any, status: number = 200) => {
    return NextResponse.json(data, {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
  
  try {
    // Verify the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('API: Missing or invalid authorization header');
      return jsonResponse(
        { 
          error: 'Missing or invalid authorization header',
          message: 'Please log in to access this resource'
        },
        401
      );
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token);
    
    if (!decodedToken) {
      console.log('API: Unauthorized - Invalid or expired token');
      return jsonResponse(
        { 
          error: 'Unauthorized',
          message: 'Your session has expired. Please log in again.'
        },
        401
      );
    }
    
    // Parse the request body
    let projectData: ProjectInput;
    try {
      projectData = await request.json();
    } catch (error) {
      console.error('API: Error parsing request body:', error);
      return jsonResponse(
        { 
          error: 'Invalid request body',
          message: 'The request body must be a valid JSON object'
        },
        400
      );
    }
    
    // Validate required fields
    if (!projectData.title) {
      return jsonResponse(
        { 
          error: 'Validation error',
          message: 'Project title is required',
          field: 'title'
        },
        400
      );
    }
    
    // Create the new project with all required fields
    const newProject: Project = {
      ...projectData,
      id: Math.random().toString(36).substring(2, 11),
      title: projectData.title,
      description: projectData.description || '',
      technologies: projectData.technologies || [],
      github: projectData.github || '',
      live: projectData.live || '',
      images: projectData.images || [],
      startDate: projectData.startDate || new Date(),
      endDate: projectData.endDate || 'Present',
      status: projectData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      documentation: projectData.documentation,
      githubUrl: projectData.githubUrl,
      demoUrl: projectData.demoUrl,
      tags: projectData.tags,
      featured: projectData.featured
    };
    
    // Add the new project to the store
    const currentProjects = projectStore.getProjects();
    const updatedProjects = [...currentProjects, newProject];
    saveProjects(updatedProjects);
    
    console.log('API: Created new project with ID:', newProject.id);
    
    return jsonResponse(
      { 
        success: true, 
        message: 'Project created successfully',
        project: newProject 
      },
      201
    );
    
  } catch (error) {
    console.error('API: Error in POST /api/admin/projects:', error);
    return jsonResponse(
      { 
        error: 'Internal Server Error',
        message: 'An error occurred while creating the project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  } finally {
    console.log('API: POST /api/admin/projects - End');
  }
}

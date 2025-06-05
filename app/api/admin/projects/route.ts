import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';
import { Project, ProjectStatus, ProjectInput } from '@/data/types';

// Extended Project type that includes all possible fields from both types
type ProjectWithAllFields = Project & {
  githubUrl?: string;
  demoUrl?: string;
  tags?: string[];
  image?: string;
  featured?: boolean;
};
import fs from 'fs';
import path from 'path';
import admin from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

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
    
    const decodedToken = await getAuth(admin).verifyIdToken(idToken);
    console.log('API: Decoded token:', {
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      uid: decodedToken.uid
    });
    
    // Check if the user is the admin
    const isAdmin = decodedToken.email === 'rvimman@gmail.com';
    console.log(`API: Is admin (${decodedToken.email} === 'rvimman@gmail.com'):`, isAdmin);
    
    if (isAdmin) {
      console.log('API: Token verified successfully for admin user');
      return decodedToken;
    }
    
    console.log('API: User is not an admin');
    return null;
  } catch (error) {
    console.error('API: Error verifying token:', error);
    return null;
  }
}

// Helper function to format a date for the TypeScript file
const formatDateForTS = (date: Date | string | 'Present'): string => {
  if (date === 'Present') return "'Present'";
  const dateObj = date instanceof Date ? date : new Date(date);
  return `new Date('${dateObj.toISOString()}')`;
};

// Helper function to save projects to the data file
const saveProjects = (projectsData: ProjectWithAllFields[]) => {
  const filePath = path.join(process.cwd(), 'data/projects.ts');
  
  // Prepare the projects data with proper formatting for the TypeScript file
  const projectsContent = projectsData.map(project => {
    const projectData: any = {
      title: project.title,
      description: project.description,
      technologies: project.technologies || [],
      github: project.github || project.githubUrl || '',
      live: project.live || project.demoUrl || '',
      documentation: project.documentation || '',
      images: project.images || [],
      startDate: formatDateForTS(project.startDate),
      endDate: formatDateForTS(project.endDate),
      status: project.status,
    };
    
    // Remove empty or undefined fields
    Object.keys(projectData).forEach(key => {
      if (projectData[key] === undefined || 
          (Array.isArray(projectData[key]) && !projectData[key].length)) {
        delete projectData[key];
      }
    });
    
    return projectData;
  });
  
  const content = `import { Project, ProjectStatus } from './types';

export const projects: Project[] = ${JSON.stringify(projectsContent, null, 2)
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"(new Date\('[^']+'\))"/g, '$1')};`;
  
  fs.writeFileSync(filePath, content, 'utf8');
};

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
        { error: 'Missing or invalid authorization header' },
        401
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      console.log('API: Unauthorized - Invalid or expired token');
      return jsonResponse(
        { error: 'Unauthorized - Invalid or expired token' },
        401
      );
    }
    
    console.log('API: Successfully authenticated, returning projects');
    return jsonResponse(projects);
  } catch (error) {
    console.error('API: Error fetching projects:', error);
    return jsonResponse(
      { 
        error: 'Failed to fetch projects',
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
  
  try {
    // Verify the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('API: Authorization header:', authHeader ? '***' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('API: Missing or invalid authorization header');
      return jsonResponse(
        { error: 'Missing or invalid authorization header' },
        401
      );
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token);
    
    if (!decodedToken) {
      console.log('API: Unauthorized - Invalid or expired token');
      return jsonResponse(
        { error: 'Unauthorized - Invalid or expired token' },
        401
      );
    }

    let projectData: ProjectInput;
    try {
      projectData = await request.json();
      console.log('API: Received project data:', JSON.stringify(projectData, null, 2));
    } catch (error) {
      console.error('API: Error parsing request body:', error);
      return jsonResponse(
        { error: 'Invalid request body' },
        400
      );
    }
    
    // Validate required fields
    if (!projectData.title || !projectData.description) {
      console.log('API: Missing required fields');
      return jsonResponse(
        { 
          error: 'Validation error',
          details: 'Title and description are required' 
        },
        400
      );
    }
    
    // Handle dates
    const now = new Date();
    const startDate = projectData.startDate 
      ? new Date(projectData.startDate)
      : now;
      
    const endDate = projectData.endDate && projectData.endDate !== 'Present' 
      ? new Date(projectData.endDate) 
      : projectData.endDate;
    
    // Create new project with all fields
    const newProject: ProjectWithAllFields = {
      ...projectData,
      id: Date.now().toString(),
      technologies: projectData.technologies || [],
      images: projectData.images || [],
      github: projectData.github || projectData.githubUrl || '',
      live: projectData.live || projectData.demoUrl || '',
      startDate,
      endDate: endDate || 'Present',
      status: (projectData.status || 'active') as ProjectStatus,
      createdAt: now,
      updatedAt: now,
    };
    
    // Remove any undefined fields
    Object.keys(newProject).forEach(key => {
      if (newProject[key as keyof ProjectWithAllFields] === undefined) {
        delete newProject[key as keyof ProjectWithAllFields];
      }
    });
    
    // Add the new project to the beginning of the array
    projects.unshift(newProject as unknown as Project);
    
    try {
      // Save the updated projects to the data file
      saveProjects(projects as unknown as ProjectWithAllFields[]);
      console.log('API: Project created successfully');
      
      return jsonResponse(
        { 
          success: true,
          message: 'Project created successfully',
          project: newProject 
        },
        201
      );
    } catch (error) {
      console.error('API: Error saving projects:', error);
      return jsonResponse(
        { 
          error: 'Failed to save project',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  } catch (error) {
    console.error('API: Error in POST handler:', error);
    return jsonResponse(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  } finally {
    console.log('API: POST /api/admin/projects - End');
  }
}

import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';
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
  try {
    if (!token) return null;
    
    // Remove 'Bearer ' prefix if present
    const idToken = token.replace(/^Bearer\s+/, '');
    const decodedToken = await getAuth(admin).verifyIdToken(idToken);
    
    // Check if the user is the admin
    if (decodedToken.email === 'rvimman@gmail.com') {
      return decodedToken;
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Helper function to save projects to the data file
const saveProjects = (projects: any[]) => {
  try {
    const filePath = path.join(process.cwd(), 'src/data/projects.ts');
    const dirPath = path.dirname(filePath);
    
    // Ensure the directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Create the TypeScript file content
    const content = `// This file is auto-generated. Do not edit it directly.
import { Project } from './types';

export const projects: Project[] = ${JSON.stringify(projects, null, 2).replace(/"(\w+)":/g, '$1:').replace(/\"/g, "'")};
`;
    
    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Projects saved successfully to:', filePath);
  } catch (error) {
    console.error('Error saving projects:', error);
    throw error; // Re-throw to be caught by the calling function
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('API: GET /api/admin/projects/[id] - Start');
  console.log('API: Project ID to fetch:', params.id);
  
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
    
    // Find the project
    const projectTitle = decodeURIComponent(params.id);
    const project = projects.find(p => p.title === projectTitle);
    
    if (!project) {
      console.log(`API: Project not found with title: ${projectTitle}`);
      return jsonResponse(
        { 
          error: 'Project not found',
          details: `No project found with title: ${projectTitle}`
        },
        404
      );
    }
    
    console.log('API: Returning project:', JSON.stringify(project, null, 2));
    return jsonResponse(project);
  } catch (error) {
    console.error('API: Error in GET handler:', error);
    return jsonResponse(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  } finally {
    console.log('API: GET /api/admin/projects/[id] - End');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('\n=== API: PUT /api/admin/projects/[id] ===');
  console.log('Project ID to update:', params.id);
  
  try {
    // 1. Verify authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return jsonResponse(
        { 
          success: false,
          error: 'Missing or invalid authorization header',
          details: 'Please provide a valid Bearer token'
        },
        401
      );
    }
    
    // 2. Verify token
    const token = authHeader.split(' ')[1];
    console.log('Verifying token...');
    
    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      console.error('Unauthorized - Invalid or expired token');
      return jsonResponse(
        { 
          success: false,
          error: 'Unauthorized',
          details: 'Invalid or expired authentication token'
        },
        401
      );
    }
    console.log('Token verified for user:', decodedToken.email);
    
    // 3. Parse request body
    let updateData;
    try {
      updateData = await request.json();
      console.log('Received update data:', JSON.stringify(updateData, null, 2));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return jsonResponse(
        { 
          success: false,
          error: 'Invalid request body',
          details: 'The request body must be valid JSON'
        },
        400
      );
    }
    
    // 4. Find the project to update
    const projectTitle = decodeURIComponent(params.id);
    console.log('Looking for project with title:', projectTitle);
    
    const projectIndex = projects.findIndex(p => p.title === projectTitle);
    if (projectIndex === -1) {
      console.error('Project not found with title:', projectTitle);
      return jsonResponse(
        { 
          success: false,
          error: 'Project not found',
          details: `No project found with title: ${projectTitle}`
        },
        404
      );
    }
    
    console.log('Found project at index:', projectIndex);
    
    // 5. Create updated project object
    const now = new Date();
    const updatedProject = {
      ...projects[projectIndex],
      ...updateData,
      updatedAt: now.toISOString(),
    };
    
    console.log('Updated project data:', JSON.stringify(updatedProject, null, 2));
    
    // 6. Update the projects array
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = updatedProject as any;
    
    try {
      console.log('Attempting to save projects...');
      saveProjects(updatedProjects);
      console.log('Projects saved successfully');
      
      return jsonResponse({
        success: true,
        message: 'Project updated successfully',
        project: updatedProject
      });
    } catch (error) {
      console.error('Error saving projects:', error);
      return jsonResponse(
        { 
          success: false,
          error: 'Failed to save project',
          details: error instanceof Error ? error.message : 'Unknown error occurred while saving'
        },
        500
      );
    }
  } catch (error) {
    console.error('API: Error in PUT handler:', error);
    return jsonResponse(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  } finally {
    console.log('API: PUT /api/admin/projects/[id] - End');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('API: DELETE /api/admin/projects/[id] - Start');
  console.log('API: Project ID to delete:', params.id);
  
  try {
    // Verify the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('API: Authorization header:', authHeader ? '***' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('API: Missing or malformed authorization header');
      return jsonResponse(
        { error: 'Missing or invalid authorization header' },
        401
      );
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token);
    
    if (!decodedToken) {
      console.log('API: Unauthorized - Invalid or missing token');
      return jsonResponse(
        { error: 'Unauthorized - Invalid or expired token' },
        401
      );
    }
    
    const projectTitle = decodeURIComponent(params.id);
    console.log('API: Decoded project title:', projectTitle);
    
    const projectIndex = projects.findIndex(p => p.title === projectTitle);
    console.log('API: Found project at index:', projectIndex);
    
    if (projectIndex === -1) {
      console.log('API: Project not found');
      return jsonResponse(
        { 
          error: 'Project not found',
          details: `No project found with title: ${projectTitle}`
        },
        404
      );
    }
    
    // Remove the project
    const [deletedProject] = projects.splice(projectIndex, 1);
    console.log('API: Project removed from memory:', deletedProject.title);
    
    try {
      // Save the updated projects to the data file
      saveProjects(projects);
      console.log('API: Projects saved to file');
      
      return jsonResponse({
        success: true,
        message: `Project "${deletedProject.title}" deleted successfully`,
        project: deletedProject
      });
    } catch (error) {
      console.error('API: Error saving projects:', error);
      return jsonResponse(
        { 
          error: 'Failed to save projects after deletion',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  } catch (error) {
    console.error('API: Error in DELETE handler:', error);
    return jsonResponse(
      { 
        error: 'Failed to delete project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  } finally {
    console.log('API: DELETE /api/admin/projects/[id] - End');
  }
}

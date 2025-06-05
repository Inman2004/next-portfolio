import { NextResponse } from 'next/server';
import { Project, ProjectInput, ProjectStatus } from '../../types';

// Import the project store and save function from the main route
const mainRoute = await import('../route');
const projectStore = mainRoute.projectStore;

// Get the current projects from the store
const getProjects = (): Project[] => projectStore.getProjects();

// Update projects in the store
const updateProjects = (newProjects: Project[]): Project[] => {
  projectStore.setProjects(newProjects);
  return getProjects();
};

// Import the saveProjects function with a different name to avoid conflicts
const { saveProjects: saveProjectsToStore } = mainRoute;

// Helper function to create consistent JSON responses
const jsonResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Initialize with the imported in-memory projects

// Helper to verify the Firebase ID token using the Firebase REST API
async function verifyToken(token: string) {
  try {
    if (!token) return null;
    
    // Remove 'Bearer ' prefix if present
    const idToken = token.replace(/^Bearer\s+/, '');
    
    // Verify token using Firebase REST API
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error verifying token:', data);
      return null;
    }
    
    const user = data.users?.[0];
    if (!user) {
      console.log('No user found for token');
      return null;
    }
    
    // Check if the user is the admin
    if (user.email === 'rvimman@gmail.com') {
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Helper function to update projects in memory
const saveProjects = (projectsData: Project[]) => {
  try {
    // Create a new array with the updated projects
    const updatedProjects = projectsData.map(project => {
      const updatedProject: Project = {
        ...project,
        // Ensure all required fields are present
        id: project.id || Math.random().toString(36).substring(2, 11),
        title: project.title,
        description: project.description || '',
        technologies: project.technologies || [],
        github: project.github || '',
        live: project.live || '',
        images: project.images || [],
        startDate: project.startDate || new Date(),
        endDate: project.endDate || 'Present',
        status: project.status || 'active',
        createdAt: project.createdAt || new Date(),
        updatedAt: new Date(),
        documentation: project.documentation,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        tags: project.tags,
        featured: project.featured
      };
      return updatedProject;
    });
    
    // Update the local projects array
    projectStore.setProjects(updatedProjects);
    
    console.log('Projects updated in memory');
    return updatedProjects;
  } catch (error) {
    console.error('Error updating projects:', error);
    throw error;
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('API: GET /api/admin/projects/[id] - Start');
  console.log('API: Project ID to fetch:', params.id);
  
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
      
      // Find the project by ID in the local projects array
      const projectId = decodeURIComponent(params.id);
      console.log(`Looking for project with ID: ${projectId}`);
      
      const currentProjects = getProjects();
      const project = currentProjects.find((p: Project) => p.id === projectId);
      
      if (!project) {
        console.log('API: Project not found');
        return jsonResponse(
          { 
            error: 'Not Found',
            message: 'Project not found'
          },
          404
        );
      }
      
      console.log('API: Project found, returning data');
      return jsonResponse(project);
      
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
    console.error('API: Error in GET /api/admin/projects/[id]:', error);
    return jsonResponse(
      { 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching the project',
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
  
  const jsonResponse = (data: any, status: number = 200) => {
    return NextResponse.json(data, {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
  
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
          message: 'Please log in to access this resource',
          details: 'No valid Bearer token provided'
        },
        401
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // 2. Verify token
      const decodedToken = await verifyToken(token);
      if (!decodedToken) {
        console.error('Unauthorized - Invalid or expired token');
        return jsonResponse(
          { 
            success: false,
            error: 'Unauthorized',
            message: 'Your session has expired. Please log in again.'
          },
          401
        );
      }
      
      // 3. Parse request body
      let updateData: ProjectInput;
      try {
        updateData = await request.json();
        console.log('Update data:', JSON.stringify(updateData, null, 2));
      } catch (error) {
        console.error('Error parsing request body:', error);
        return jsonResponse(
          { 
            success: false,
            error: 'Invalid request body',
            message: 'Could not parse JSON data from request'
          },
          400
        );
      }
      
      // 4. Find the project to update in the local projects array
      const projectId = decodeURIComponent(params.id);
      console.log(`Looking for project with ID: ${projectId}`);
      
      const currentProjects = getProjects();
      const projectIndex = currentProjects.findIndex((p: Project) => p.id === projectId);
      
      if (projectIndex === -1) {
        console.error(`Project not found with ID: ${projectId}`);
        return jsonResponse(
          { 
            success: false,
            error: 'Project not found',
            message: `No project found with ID: ${projectId}`
          },
          404
        );
      }
      
      // 5. Update the project with proper typing and required fields
      const projectToUpdate = currentProjects[projectIndex];
      const updatedProject: Project = {
        ...projectToUpdate,
        ...updateData,
        id: projectId, // Ensure ID cannot be changed
        title: updateData.title || projectToUpdate.title,
        description: updateData.description || projectToUpdate.description,
        technologies: updateData.technologies || projectToUpdate.technologies || [],
        images: updateData.images || projectToUpdate.images || [],
        startDate: updateData.startDate || projectToUpdate.startDate || new Date(),
        endDate: updateData.endDate || projectToUpdate.endDate || 'Present',
        status: updateData.status || projectToUpdate.status || 'active',
        updatedAt: new Date(),
        // Preserve existing values for optional fields if not provided in update
        documentation: updateData.documentation !== undefined ? updateData.documentation : projectToUpdate.documentation,
        githubUrl: updateData.githubUrl !== undefined ? updateData.githubUrl : projectToUpdate.githubUrl,
        demoUrl: updateData.demoUrl !== undefined ? updateData.demoUrl : projectToUpdate.demoUrl,
        tags: updateData.tags !== undefined ? updateData.tags : projectToUpdate.tags,
        featured: updateData.featured !== undefined ? updateData.featured : projectToUpdate.featured
      };
      
      // Ensure required fields are not removed
      if (!updatedProject.title || !updatedProject.description) {
        console.error('Missing required fields');
        return jsonResponse(
          { 
            success: false,
            error: 'Validation error',
            message: 'Title and description are required',
            details: 'Please provide both title and description for the project'
          },
          400
        );
      }
      
      // Create a new array with the updated project
      const updatedProjectsList = [...currentProjects];
      updatedProjectsList[projectIndex] = updatedProject;
      
      try {
        // 6. Update the projects in the store
        updateProjects(updatedProjectsList);
        
        console.log('Project updated successfully');
        return jsonResponse(
          { 
            success: true,
            message: 'Project updated successfully',
            project: updatedProject
          },
          200
        );
      } catch (error) {
        console.error('Error saving projects:', error);
        return jsonResponse(
          { 
            success: false,
            error: 'Failed to update project',
            message: 'An error occurred while updating the project',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          500
        );
      }
    } catch (authError) {
      console.error('Authentication error:', authError);
      return jsonResponse(
        { 
          success: false,
          error: 'Authentication failed',
          message: 'Failed to verify your credentials. Please log in again.'
        },
        401
      );
    }
  } catch (error) {
    console.error('Unexpected error in PUT /api/admin/projects/[id]:', error);
    return jsonResponse(
      { 
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
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
  console.log('\n=== API: DELETE /api/admin/projects/[id] ===');
  console.log('Project ID to delete:', params.id);
  
  const jsonResponse = (data: any, status: number = 200) => {
    return NextResponse.json(data, {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
  
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
          message: 'Please log in to access this resource',
          details: 'No valid Bearer token provided'
        },
        401
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // 2. Verify token
      const decodedToken = await verifyToken(token);
      if (!decodedToken) {
        console.error('Unauthorized - Invalid or expired token');
        return jsonResponse(
          { 
            success: false,
            error: 'Unauthorized',
            message: 'Your session has expired. Please log in again.'
          },
          401
        );
      }
      
      // 3. Find the project to delete in the local projects array
      const projectId = decodeURIComponent(params.id);
      console.log('Looking for project with ID to delete:', projectId);
      
      const currentProjects = getProjects();
      const projectIndex = currentProjects.findIndex((p: Project) => p.id === projectId);
      
      if (projectIndex === -1) {
        console.error('Project not found with ID:', projectId);
        return jsonResponse(
          { 
            success: false,
            error: 'Project not found',
            message: `No project found with ID: ${projectId}`,
            details: 'The specified project does not exist or has already been deleted'
          },
          404
        );
      }
      
      console.log('Found project at index:', projectIndex, 'Title:', currentProjects[projectIndex]?.title);
      
      // 4. Create new array without the deleted project
      const filteredProjects = currentProjects.filter((project: Project) => project.id !== projectId);
      
      try {
        // 5. Update the projects in the store
        updateProjects(filteredProjects);
        console.log('Project deleted successfully');
        
        return jsonResponse(
          { 
            success: true,
            message: 'Project deleted successfully',
            projectId: projectId
          },
          200
        );
      } catch (error) {
        console.error('Error saving projects after deletion:', error);
        return jsonResponse(
          { 
            success: false,
            error: 'Failed to delete project',
            message: 'An error occurred while deleting the project',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          500
        );
      }
    } catch (authError) {
      console.error('Authentication error:', authError);
      return jsonResponse(
        { 
          success: false,
          error: 'Authentication failed',
          message: 'Failed to verify your credentials. Please log in again.'
        },
        401
      );
    }
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/projects/[id]:', error);
    return jsonResponse(
      { 
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  } finally {
    console.log('API: DELETE /api/admin/projects/[id] - End');
  }
}

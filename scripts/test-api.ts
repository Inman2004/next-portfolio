// This is a test script to verify the API endpoints
// Run with: npx ts-node --project ./scripts/tsconfig.json scripts/test-api.ts

// Import types using type import
type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  images: string[];
  startDate: string | Date;
  endDate: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  documentation?: string;
  githubUrl?: string;
  demoUrl?: string;
  tags?: string[];
  featured?: boolean;
  github?: string;
  live?: string;
};

// Simple fetch wrapper for API calls
const fetchApi = async (endpoint: string, options: any = {}) => {
  const url = `http://localhost:3000/api/admin/projects${endpoint}`;
  console.log(`\n=== Testing: ${options.method || 'GET'} ${url} ===`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // Replace with a valid token
        ...options.headers,
      },
    });
    
    const data = await response.json().catch(() => ({}));
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { status: response.status, data };
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

// Test GET all projects
async function testGetAllProjects() {
  return fetchApi('');
}

// Test GET single project
async function testGetProject(id: string) {
  return fetchApi(`/${id}`);
}

// Test CREATE project
async function testCreateProject(projectData: Omit<Partial<Project>, 'id'>) {
  return fetchApi('', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
}

// Test UPDATE project
async function testUpdateProject(id: string, updateData: Omit<Partial<Project>, 'id'>) {
  return fetchApi(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

// Test DELETE project
async function testDeleteProject(id: string) {
  return fetchApi(`/${id}`, {
    method: 'DELETE',
  });
}

// Run tests
async function runTests() {
  console.log('Starting API tests...');
  
  try {
    // Test 1: Get all projects
    console.log('\n--- Test 1: Get all projects ---');
    const allProjects = await testGetAllProjects();
    const projects = Array.isArray(allProjects.data) ? allProjects.data : [];
    
    if (projects.length > 0) {
      const firstProjectId = projects[0].id;
      
      // Test 2: Get single project
      console.log('\n--- Test 2: Get single project ---');
      await testGetProject(firstProjectId);
      
      // Test 3: Update project
      console.log('\n--- Test 3: Update project ---');
      await testUpdateProject(firstProjectId, { 
        title: 'Updated ' + projects[0].title,
        description: 'This project has been updated',
      });
      
      // Test 4: Verify update
      console.log('\n--- Test 4: Verify update ---');
      await testGetProject(firstProjectId);
      
      // Test 5: Create new project
      console.log('\n--- Test 5: Create new project ---');
      const newProject = await testCreateProject({
        title: 'New Test Project',
        description: 'This is a test project',
        technologies: ['Next.js', 'TypeScript'],
        status: 'active',
      });
      
      const newProjectId = newProject.data?.id;
      
      if (newProjectId) {
        // Test 6: Delete project
        console.log('\n--- Test 6: Delete project ---');
        await testDeleteProject(newProjectId);
      }
      
      // Test 7: Verify projects list after operations
      console.log('\n--- Test 7: Verify projects list after operations ---');
      await testGetAllProjects();
      
    } else {
      console.log('No projects found. Skipping some tests.');
    }
    
    console.log('\nAll tests completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();

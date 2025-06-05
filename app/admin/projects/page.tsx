'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/data/projects';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { getAuthToken, setAuthToken, removeAuthToken } from '@/lib/admin';

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProjects = async () => {
      console.log('ProjectsPage: Starting to load projects');
      try {
        // Get the current user
        const currentUser = auth.currentUser;
        console.log('ProjectsPage: Current user from auth:', currentUser?.email || 'none');
        
        if (!currentUser) {
          console.log('ProjectsPage: No user found, redirecting to signin');
          router.push('/signin?callbackUrl=/admin/projects');
          return;
        }
        
        // Get the ID token
        console.log('ProjectsPage: Getting ID token...');
        const token = await currentUser.getIdToken();
        if (!token) {
          console.error('ProjectsPage: Failed to get ID token');
          router.push('/signin?callbackUrl=/admin/projects');
          return;
        }
        console.log('ProjectsPage: Successfully got ID token');
        
        // Fetch projects with the token in the Authorization header
        console.log('ProjectsPage: Fetching projects from API...');
        const apiUrl = '/api/admin/projects';
        console.log('ProjectsPage: Making request to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json' // Explicitly request JSON
          },
          credentials: 'same-origin' // Include cookies for session
        });
        
        console.log('ProjectsPage: API response status:', response.status);
        console.log('ProjectsPage: Response content-type:', response.headers.get('content-type'));
        
        // Check if the response is JSON before trying to parse it
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // If we got HTML, it's probably a redirect to login
          if (response.status === 401 || response.redirected) {
            console.log('ProjectsPage: Received non-JSON response, likely a redirect to login');
            router.push('/signin?callbackUrl=/admin/projects');
            return;
          }
          
          // For other non-JSON responses, try to get the text and log it
          const responseText = await response.text();
          console.error('ProjectsPage: Received non-JSON response:', responseText.substring(0, 500));
          throw new Error(`Expected JSON response but got: ${contentType}`);
        }
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error('ProjectsPage: Failed to load projects:', errorData.error || 'Unknown error');
            
            // If unauthorized, redirect to signin
            if (response.status === 401) {
              console.log('ProjectsPage: Unauthorized, redirecting to signin');
              router.push('/signin?callbackUrl=/admin/projects');
              return;
            }
            
            // Show error to user
            alert(`Failed to load projects: ${errorData.error || 'Unknown error'}`);
          } catch (e) {
            console.error('ProjectsPage: Failed to parse error response:', e);
            alert('Failed to load projects. Please check the console for details.');
          }
          return;
        }
        
        const data = await response.json();
        console.log(`ProjectsPage: Successfully loaded ${data.length} projects`);
        setProjects(data);
      } catch (error) {
        console.error('ProjectsPage: Error loading projects:', error);
        // If there's an error, redirect to signin
        router.push('/signin?callbackUrl=/admin/projects');
      } finally {
        console.log('ProjectsPage: Finished loading projects');
        setLoading(false);
      }
    };

    loadProjects();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    console.log('handleDelete: Starting deletion of project:', id);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('handleDelete: No user found');
        router.push('/signin?callbackUrl=/admin/projects');
        return;
      }

      console.log('handleDelete: Getting ID token...');
      const token = await currentUser.getIdToken();
      if (!token) {
        console.error('handleDelete: Failed to get ID token');
        router.push('/signin?callbackUrl=/admin/projects');
        return;
      }
      
      const url = `/api/admin/projects/${encodeURIComponent(id)}`;
      console.log('handleDelete: Sending DELETE request to:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Explicitly request JSON response
        }
      });

      console.log('handleDelete: Received response status:', response.status);
      
      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type');
      let responseData = null;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
          console.log('handleDelete: Response data:', responseData);
        } catch (e) {
          console.error('handleDelete: Failed to parse JSON response:', e);
        }
      } else {
        const text = await response.text();
        console.error('handleDelete: Non-JSON response received:', text);
      }
      
      if (!response.ok) {
        let errorMessage = responseData?.error || 'Unknown error';
        console.error('handleDelete: Failed to delete project:', errorMessage);
        
        if (response.status === 401) {
          console.log('handleDelete: Unauthorized, redirecting to signin');
          router.push('/signin?callbackUrl=/admin/projects');
          return;
        } else if (response.status === 404) {
          // Project not found, remove it from the local state
          console.log('handleDelete: Project not found, removing from local state');
          setProjects(projects.filter(project => project.title !== id));
          return;
        }
        
        // Show error to user
        alert(`Failed to delete project: ${errorMessage}`);
        return;
      }

      // If we get here, the deletion was successful
      console.log('handleDelete: Project deleted successfully');
      
      // Refresh the projects list by removing the deleted project
      setProjects(projects.filter(project => project.title !== id));
      
      // Show success message
      alert('Project deleted successfully');
    } catch (error) {
      console.error('handleDelete: Error deleting project:', error);
      
      // Show error to user
      alert('An error occurred while deleting the project. Please try again.');
      
      // Only redirect to signin if it's an auth-related error
      if (error instanceof Error && error.message.includes('auth')) {
        router.push('/signin?callbackUrl=/admin/projects');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      removeAuthToken();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/projects/new" className="flex items-center gap-2">
              <Plus size={16} />
              Add Project
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Technologies
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {projects.map((project) => (
                <tr key={project.title} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{project.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {project.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      project.status === 'deployed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}`} target="_blank">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/projects/edit/${encodeURIComponent(project.title)}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDelete(project.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

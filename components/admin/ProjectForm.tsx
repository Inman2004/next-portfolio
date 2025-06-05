'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project, ProjectStatus } from '@/data/projects';

type ProjectFormData = Omit<Project, 'startDate' | 'endDate'> & {
  startDate: string | Date;
  endDate: string;
};

const defaultProject: ProjectFormData = {
  title: '',
  description: '',
  technologies: [],
  github: '',
  live: '',
  documentation: '',
  images: [],
  startDate: new Date().toISOString().split('T')[0],
  endDate: 'Present',
  status: 'in-progress',
};

interface ProjectFormProps {
  projectId?: string;
  initialData?: ProjectFormData;
  onSuccess?: () => void;
}

export default function ProjectForm({ projectId, initialData, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ProjectFormData>(initialData || defaultProject);
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    if (projectId && !initialData) {
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/admin/projects/${projectId}`);
          if (response.ok) {
            const data = await response.json();
            setFormData({
              ...data,
              startDate: data.startDate,
              endDate: data.endDate === 'Present' ? 'Present' : new Date(data.endDate).toISOString().split('T')[0],
            });
          } else {
            setError('Failed to load project');
          }
        } catch (err) {
          console.error('Error fetching project:', err);
          setError('Failed to load project');
        }
      };

      fetchProject();
    }
  }, [projectId, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      const value = techInput.trim();
      if (value && !formData.technologies.includes(value)) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, value]
        }));
        setTechInput('');
      }
    }
  };

  const removeTech = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      console.log('\n=== ProjectForm: Starting form submission ===');
      
      // 1. Get current user and verify authentication
      const currentUser = auth.currentUser;
      console.log('ProjectForm: Current user:', currentUser?.email || 'Not authenticated');
      
      if (!currentUser) {
        console.error('ProjectForm: No authenticated user found');
        router.push('/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
        return;
      }

      // 2. Get ID token
      console.log('ProjectForm: Getting ID token...');
      const token = await currentUser.getIdToken(true); // Force token refresh
      if (!token) {
        const errorMsg = 'Failed to get authentication token';
        console.error('ProjectForm:', errorMsg);
        throw new Error(errorMsg);
      }
      console.log('ProjectForm: Successfully obtained ID token');

      // 3. Prepare request
      const method = projectId ? 'PUT' : 'POST';
      const url = projectId 
        ? `/api/admin/projects/${encodeURIComponent(projectId)}`
        : '/api/admin/projects';

      const requestBody = {
        ...formData,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      console.log(`\n=== ProjectForm: Sending ${method} request ===`);
      console.log('URL:', url);
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? '***' : 'MISSING'}`,
        'Accept': 'application/json'
      });
      console.log('Body:', JSON.stringify(requestBody, null, 2));

      // 4. Send request
      let response;
      try {
        response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
        });
      } catch (networkError) {
        console.error('ProjectForm: Network error during fetch:', networkError);
        throw new Error('Network error. Please check your connection and try again.');
      }

      // 5. Process response
      console.log('\n=== ProjectForm: Received response ===');
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      let responseData;
      const responseText = await response.text();
      
      // Try to parse as JSON if possible
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log('Response data:', responseData);
      } catch (parseError) {
        console.error('ProjectForm: Failed to parse response as JSON:', parseError);
        console.error('Response text:', responseText);
        throw new Error(`Invalid server response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        console.error('ProjectForm: API returned error:', responseData);
        const errorMessage = responseData?.error || 
                            responseData?.message || 
                            `Failed to save project: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('ProjectForm: Project saved successfully');
      
      // Show success message
      const successMessage = projectId ? 'Project updated successfully!' : 'Project created successfully!';
      console.log(successMessage);
      alert(successMessage);
      
      // Handle success
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/projects');
      }
    } catch (error) {
      console.error('ProjectForm: Error saving project:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while saving the project'
      );
      
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {projectId ? 'Edit Project' : 'Add New Project'}
          </h1>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectStatus) =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                  <SelectItem value="outdated">Outdated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Technologies</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.technologies.map(tech => (
                <span
                  key={tech}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 text-muted-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Type a technology and press Enter"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechKeyDown}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                name="github"
                type="url"
                value={formData.github}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="live">Live URL</Label>
              <Input
                id="live"
                name="live"
                type="url"
                value={formData.live}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentation">Documentation URL</Label>
              <Input
                id="documentation"
                name="documentation"
                type="url"
                value={formData.documentation || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate instanceof Date ? formData.startDate.toISOString().split('T')[0] : formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="flex gap-2">
                <Input
                  id="endDate"
                  name="endDate"
                  type={formData.endDate === 'Present' ? 'text' : 'date'}
                  value={formData.endDate === 'Present' ? '' : formData.endDate}
                  onChange={handleChange}
                  disabled={formData.endDate === 'Present'}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant={formData.endDate === 'Present' ? 'default' : 'outline'}
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      endDate: prev.endDate === 'Present' ? '' : 'Present',
                    }))
                  }
                >
                  {formData.endDate === 'Present' ? 'Ongoing' : 'Mark as Ongoing'}
                </Button>
              </div>
            </div>
          </div>

          {/* Image upload would go here */}
          
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProjectForm from '@/components/admin/ProjectForm';
import { Loader2 } from 'lucide-react';

export default function EditProjectPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user && mounted) {
      router.push(`/signin?redirect=/admin/projects/edit/${id}`);
    }
  }, [user, authLoading, router, id, mounted]);

  useEffect(() => {
    if (!id || !mounted) return;

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          const error = await response.json();
          setError(error.error || 'Failed to load project');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, mounted]);

  if (authLoading || loading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Project not found
        </div>
      </div>
    );
  }

  return <ProjectForm projectId={project.title} initialData={project} />;
}

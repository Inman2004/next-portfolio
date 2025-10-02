import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { redirect } from 'next/navigation';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { Project } from '@/types/project';
import { ADMIN_EMAIL } from '@/types/blog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectItem } from './ProjectItem';

export const dynamic = 'force-dynamic';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = getFirestore();

async function getProjects() {
  const projectsSnapshot = await db.collection('projects').orderBy('title').get();
  return projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export default async function AdminProjectsPage() {
  const user = await getAuthenticatedUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/signin');
  }

  const projects = await getProjects();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map(project => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
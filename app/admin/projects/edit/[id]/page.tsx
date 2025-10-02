import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { Project } from '@/types/project';
import { updateProject } from '../../actions';
import { ProjectForm } from '../../ProjectForm';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { redirect } from 'next/navigation';
import { ADMIN_EMAIL } from '@/types/blog';

export const dynamic = 'force-dynamic';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = getFirestore();

async function getProject(id: string): Promise<Project | null> {
  const doc = await db.collection('projects').doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as Project;
}

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/signin');
  }

  const project = await getProject(params.id);

  if (!project) {
    return <div>Project not found</div>;
  }

  const updateProjectWithId = updateProject.bind(null, project.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
      <ProjectForm action={updateProjectWithId} project={project} />
    </div>
  );
}
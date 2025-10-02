'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { Project } from '@/types/project';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { ADMIN_EMAIL } from '@/types/blog';
import { redirect } from 'next/navigation';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = getFirestore();

export async function createProject(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  const newProject: Omit<Project, 'id'> = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    technologies: (formData.get('technologies') as string).split(','),
    github: formData.get('github') as string,
    live: formData.get('live') as string,
    images: (formData.get('images') as string).split(','),
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    status: formData.get('status') as Project['status'],
  };

  const docRef = await db.collection('projects').add(newProject);

  revalidatePath('/admin/projects');
  redirect('/admin/projects');
}

export async function updateProject(id: string, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  const updatedProject: Partial<Project> = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    technologies: (formData.get('technologies') as string).split(','),
    github: formData.get('github') as string,
    live: formData.get('live') as string,
    images: (formData.get('images') as string).split(','),
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    status: formData.get('status') as Project['status'],
  };

  await db.collection('projects').doc(id).update(updatedProject);

  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/edit/${id}`);
  redirect('/admin/projects');
}

export async function deleteProject(id: string) {
  const user = await getAuthenticatedUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  await db.collection('projects').doc(id).delete();

  revalidatePath('/admin/projects');
}
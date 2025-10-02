'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { ExperienceType } from '@/data/experiences';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = getFirestore();

export async function createExperience(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || user.email !== 'rvimman@gmail.com') {
    throw new Error('Unauthorized');
  }

  const newExperience: Omit<ExperienceType, 'id'> = {
    role: formData.get('role') as string,
    company: formData.get('company') as string,
    location: formData.get('location') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    description: (formData.get('description') as string).split('\n'),
    skills: (formData.get('skills') as string).split(','),
    status: (formData.get('status') as string).split(',') as ExperienceType['status'],
  };

  const experiencesRef = db.collection('experiences');
  const snapshot = await experiencesRef.orderBy('id', 'desc').limit(1).get();
  const lastId = snapshot.docs.length > 0 ? snapshot.docs[0].data().id : 0;

  const newId = lastId + 1;

  await experiencesRef.doc(String(newId)).set({ ...newExperience, id: newId });

  revalidatePath('/admin');
  revalidatePath('/'); // Also revalidate home page if experiences are shown there
}

export async function updateExperience(id: number, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user || user.email !== 'rvimman@gmail.com') {
    throw new Error('Unauthorized');
  }

  const updatedExperience: Partial<ExperienceType> = {
    role: formData.get('role') as string,
    company: formData.get('company') as string,
    location: formData.get('location') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    description: (formData.get('description') as string).split('\n'),
    skills: (formData.get('skills') as string).split(','),
    status: (formData.get('status') as string).split(',') as ExperienceType['status'],
  };

  await db.collection('experiences').doc(String(id)).update(updatedExperience);

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteExperience(id: number) {
  const user = await getAuthenticatedUser();
  if (!user || user.email !== 'rvimman@gmail.com') {
    throw new Error('Unauthorized');
  }

  await db.collection('experiences').doc(String(id)).delete();

  revalidatePath('/admin');
  revalidatePath('/');
}
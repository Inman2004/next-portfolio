export const dynamic = 'force-dynamic';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { redirect } from 'next/navigation';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { ExperienceType } from '@/data/experiences';
import { AddExperienceForm } from './AddExperienceForm';
import { ExperienceItem } from './ExperienceItem';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = getFirestore();

async function getExperiences() {
  const experiencesSnapshot = await db.collection('experiences').orderBy('id').get();
  return experiencesSnapshot.docs.map(doc => doc.data() as ExperienceType);
}

export default async function AdminPage() {
  const user = await getAuthenticatedUser();

  if (!user || user.email !== 'rvimman@gmail.com') {
    redirect('/signin');
  }

  const experiences = await getExperiences();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Manage Experiences</h2>
        <AddExperienceForm />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Current Experiences</h3>
        <div className="space-y-4">
          {experiences.map(exp => (
            <ExperienceItem key={exp.id} experience={exp} />
          ))}
        </div>
      </div>
    </div>
  );
}
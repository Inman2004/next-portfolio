import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';
import { redirect } from 'next/navigation';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { ExperienceType } from '@/data/experiences';
import { AddExperienceForm } from './AddExperienceForm';
import { ExperienceItem } from './ExperienceItem';
import { ADMIN_EMAIL } from '@/types/blog';

export const dynamic = 'force-dynamic';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = getFirestore();

async function getExperiences() {
  const experiencesSnapshot = await db.collection('experiences').orderBy('id', 'desc').get();
  return experiencesSnapshot.docs.map(doc => doc.data() as ExperienceType);
}

export default async function AdminExperiencesPage() {
  const user = await getAuthenticatedUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/signin');
  }

  const experiences = await getExperiences();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Experiences</h1>

      <div className="mb-8">
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
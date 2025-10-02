import * as admin from 'firebase-admin';
import { experiences } from '../data/experiences';
import { projects } from '../data/projects';
import { getFirestore } from 'firebase-admin/firestore';

// You must manually set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// to point to your service account key file.
// e.g., export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = getFirestore();

async function migrateData() {
  console.log('Starting data migration...');

  // Migrate Experiences
  console.log('Migrating experiences...');
  const experiencesCollection = db.collection('experiences');
  for (const experience of experiences) {
    const docRef = experiencesCollection.doc(String(experience.id));
    await docRef.set(experience);
    console.log(`  Added experience: ${experience.role} at ${experience.company}`);
  }
  console.log('Experiences migration complete.');

  // Migrate Projects
  console.log('Migrating projects...');
  const projectsCollection = db.collection('projects');
  for (const project of projects) {
    const docRef = projectsCollection.doc(String(project.id));
    await docRef.set(project);
    console.log(`  Added project: ${project.name}`);
  }
  console.log('Projects migration complete.');


  console.log('Data migration finished successfully!');
  process.exit(0);
}

migrateData().catch(error => {
  console.error('Error migrating data:', error);
  process.exit(1);
});
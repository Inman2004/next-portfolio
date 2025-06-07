import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function listUsers() {
  try {
    console.log('Fetching users from Firestore...');
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    
    if (userSnapshot.empty) {
      console.log('No users found in the database.');
      return;
    }
    
    console.log('\nUsers in the database:');
    console.log('----------------------');
    
    userSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Username: ${userData.username || 'Not set'}`);
      console.log(`Email: ${userData.email || 'Not set'}`);
      console.log(`Display Name: ${userData.displayName || 'Not set'}`);
      console.log('----------------------');
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
listUsers();

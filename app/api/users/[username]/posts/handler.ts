import { NextRequest } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, initializeFirebase } from '@/lib/firebase-server';

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    // Ensure params is resolved
    const resolvedParams = await Promise.resolve(params);
    const username = resolvedParams.username?.trim();
    if (!username) {
      return new Response(JSON.stringify({ 
        error: 'Username is required'
      }), { status: 400, headers: COMMON_HEADERS });
    }

    // Initialize Firebase
    const { db: firestoreDb } = initializeFirebase();
    if (!firestoreDb) {
      throw new Error('Failed to initialize Firestore');
    }

    // Get user by username
    console.log(`🔍 [API] Searching for user with username: "${username}"`);
    console.log('🔍 [API] Firestore database instance:', firestoreDb ? 'Initialized' : 'Not initialized');
    
      const usersRef = collection(firestoreDb, 'users');
      console.log('✅ [API] Users collection reference created');
      
      const userQuery = query(usersRef, where('username', '==', username));
      console.log('🔍 [API] Firestore query:', {
        collection: 'users',
        field: 'username',
        operator: '==',
        value: username
      });
      
      console.log('🔍 [API] Executing Firestore query...');
      const userSnapshot = await getDocs(userQuery);
      console.log(`🔍 [API] Query completed. Found ${userSnapshot.size} matching users`);
      
      // Log all users for debugging
      if (userSnapshot.size > 0) {
        console.log('📋 [API] Matching users:');
        userSnapshot.forEach(doc => {
          const userData = doc.data();
          console.log(`  - ID: ${doc.id}, Username: ${userData.username}, Email: ${userData.email}, Display Name: ${userData.displayName || 'N/A'}`);
        });
      } else {
        console.log('⚠️ [API] No users found with username:', username);
        // Try to list all usernames for debugging
        try {
          const allUsersSnapshot = await getDocs(usersRef);
          console.log(`📋 [API] Listing all ${allUsersSnapshot.size} users in the database:`);
          allUsersSnapshot.forEach(doc => {
            const userData = doc.data();
            console.log(`  - ID: ${doc.id}, Username: ${userData.username || 'N/A'}, Email: ${userData.email || 'N/A'}`);
          });
        } catch (listError) {
          console.error('❌ [API] Error listing all users:', listError);
        }
      }
    
    if (userSnapshot.empty) {
      console.error(`❌ [API] User not found with username: "${username}"`);
      return new Response(JSON.stringify({ 
        error: `User not found with username: ${username}`,
        debug: {
          searchedUsername: username,
          availableUsers: userSnapshot.size > 0 ? 
            userSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) : []
        }
      }), { status: 404, headers: COMMON_HEADERS });
    }

    const userId = userSnapshot.docs[0].id;
    
    // Get user's posts (simplified query)
    const postsRef = collection(firestoreDb, 'blogPosts');
    const postsQuery = query(
      postsRef,
      where('authorId', '==', userId),
      where('published', '==', true)
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    
    // Process posts
    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to ISO string if it exists
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
    }));
    
    return new Response(JSON.stringify({ 
      success: true, 
      posts
    }), { 
      headers: COMMON_HEADERS 
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }), { 
      status: 500, 
      headers: COMMON_HEADERS 
    });
  }
}

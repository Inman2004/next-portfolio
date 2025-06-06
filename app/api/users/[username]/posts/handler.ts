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
    const username = params.username?.trim();
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
    const usersRef = collection(firestoreDb, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      return new Response(JSON.stringify({ 
        error: 'User not found'
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

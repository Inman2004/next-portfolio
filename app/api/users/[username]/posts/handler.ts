import { NextRequest } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
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
  console.log('Handler - Received params:', params);
  
  try {
    // Ensure params is resolved
    const resolvedParams = await Promise.resolve(params);
    console.log('Handler - Resolved params:', resolvedParams);
    
    const identifier = resolvedParams.username?.trim();
    console.log('Handler - Identifier:', identifier);
    
    if (!identifier) {
      console.log('Handler - No identifier provided');
      return new Response(JSON.stringify({ 
        error: 'Identifier is required'
      }), { status: 400, headers: COMMON_HEADERS });
    }

    // Initialize Firebase
    const { db: firestoreDb } = initializeFirebase();
    if (!firestoreDb) {
      throw new Error('Failed to initialize Firestore');
    }

    const usersRef = collection(firestoreDb, 'users');
    console.log('✅ [API] Users collection reference created');
    
    let userId = null;
    
    // First try to get user by username
    console.log(`🔍 [API] Searching for user with username: "${identifier}"`);
    const userQuery = query(usersRef, where('username', '==', identifier));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      userId = userSnapshot.docs[0].id;
      console.log(`✅ [API] Found user by username: ${userId}`);
    } else {
      // If not found by username, try to get by UID
      console.log(`🔍 [API] User not found by username, trying UID: "${identifier}"`);
      try {
        const userDoc = await getDoc(doc(firestoreDb, 'users', identifier));
        if (userDoc.exists()) {
          userId = identifier;
          console.log(`✅ [API] Found user by UID: ${userId}`);
        } else {
          console.log(`❌ [API] User not found by UID either: "${identifier}"`);
        }
      } catch (error) {
        console.error('❌ [API] Error checking UID:', error);
      }
    }
    
    if (!userId) {
      console.error(`❌ [API] User not found with identifier: "${identifier}"`);
      return new Response(JSON.stringify({ 
        error: `User not found with identifier: ${identifier}`,
        debug: {
          searchedIdentifier: identifier
        }
      }), { status: 404, headers: COMMON_HEADERS });
    }
    
    console.log(`🔍 [API] Fetching posts for user ID: ${userId}`);
    
    // Get user's posts with more detailed logging
    const postsRef = collection(firestoreDb, 'blogPosts');
    const postsQuery = query(
      postsRef,
      where('authorId', '==', userId),
      where('published', '==', true)
    );
    
    console.log('📝 [API] Querying posts with:', { authorId: userId, published: true });
    
    const postsSnapshot = await getDocs(postsQuery);
    console.log(`📊 [API] Found ${postsSnapshot.size} posts for user ${userId}`);
    
    if (postsSnapshot.size === 0) {
      // Log more details when no posts are found
      console.log('⚠️ [API] No posts found. Checking if user has any unpublished posts...');
      const allPostsQuery = query(postsRef, where('authorId', '==', userId));
      const allPostsSnapshot = await getDocs(allPostsQuery);
      console.log(`ℹ️ [API] Total posts (including unpublished): ${allPostsSnapshot.size}`);
      
      if (allPostsSnapshot.size > 0) {
        console.log('ℹ️ [API] Found posts but they might be unpublished or have different authorId format');
        allPostsSnapshot.docs.forEach((doc, index) => {
          console.log(`📝 [API] Post ${index + 1}:`, {
            id: doc.id,
            authorId: doc.data().authorId,
            published: doc.data().published,
            title: doc.data().title
          });
        });
      }
    }
    
    // Process posts
    const posts = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`📄 [API] Processing post: ${doc.id}`, { 
        title: data.title, 
        authorId: data.authorId,
        published: data.published 
      });
      
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string if it exists
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        // Add publish date if available
        publishDate: data.publishDate?.toDate?.()?.toISOString()
      };
    });
    
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

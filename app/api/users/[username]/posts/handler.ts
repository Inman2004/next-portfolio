import { NextRequest } from 'next/server';
import { collection, query, where, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { db, initializeFirebase } from '@/lib/firebase-server';

// Helper function to retry operations
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        // Exponential backoff
        const waitTime = delay * Math.pow(2, i);
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
};

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
  const startTime = Date.now();
  let requestId = Math.random().toString(36).substring(2, 10);
  
  const log = (message: string, data?: any) => {
    console.log(`[${requestId}] ${message}`, data || '');
  };
  
  const logError = (message: string, error?: Error) => {
    console.error(`[${requestId}] ${message}`, error || '');
  };
  
  try {
    log('Request started');
    
    // Ensure params is resolved
    const resolvedParams = await Promise.resolve(params);
    const username = resolvedParams.username?.trim();
    
    if (!username) {
      log('Username is required');
      return new Response(JSON.stringify({ 
        error: 'Username is required',
        requestId
      }), { status: 400, headers: COMMON_HEADERS });
    }
    
    log('Initializing Firebase');
    const { db: firestoreDb } = await withRetry(() => {
      const result = initializeFirebase();
      if (!result.db) throw new Error('Firestore not initialized');
      return Promise.resolve(result);
    });

    // Get user by username with retry logic
    log(`Searching for user with username: "${username}"`);
    
    const usersRef = collection(firestoreDb, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    
    log('Executing user query');
    const userSnapshot = await withRetry(() => getDocs(userQuery));
    log(`Query completed. Found ${userSnapshot.size} matching users`);
    
    if (userSnapshot.empty) {
      log('User not found, listing all users for debugging');
      
      try {
        const allUsersSnapshot = await withRetry(() => getDocs(usersRef));
        const allUsers = allUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        log(`Found ${allUsers.length} total users in database`);
        
        return new Response(JSON.stringify({ 
          error: 'User not found',
          details: {
            searchedUsername: username,
            suggestion: 'The username might be misspelled or the user might not exist',
            availableUsernames: allUsers
              .filter((user: any) => user.username)
              .map((user: any) => user.username)
              .filter(Boolean)
              .slice(0, 10) // Limit to first 10 usernames
          },
          requestId
        }), { 
          status: 404, 
          headers: COMMON_HEADERS 
        });
      } catch (listError) {
        logError('Error listing all users', listError as Error);
        throw new Error('Failed to verify user existence');
      }
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    log(`Found user: ${userData.displayName || userData.email} (${userId})`);
    
    // Get user's published posts with retry logic
    const postsRef = collection(firestoreDb, 'blogPosts');
    const postsQuery = query(
      postsRef,
      where('authorId', '==', userId),
      where('published', '==', true)
    );
    
    log('Fetching user posts');
    const postsSnapshot = await withRetry(() => getDocs(postsQuery));
    
    // Process and return posts
    const posts = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
        // Add any other fields you need
      };
    });
    
    const responseData = {
      success: true,
      user: {
        id: userId,
        username: userData.username,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        // Add any other user fields you need
      },
      posts,
      meta: {
        count: posts.length,
        requestId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      }
    };
    
    log(`Request completed successfully. Found ${posts.length} posts.`);
    
    return new Response(JSON.stringify(responseData), { 
      headers: {
        ...COMMON_HEADERS,
        'X-Request-ID': requestId,
        'X-Duration': `${Date.now() - startTime}ms`
      }
    });
    
  } catch (error) {
    const errorId = `err_${Math.random().toString(36).substring(2, 8)}`;
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    logError(`API Error [${errorId}]:`, error instanceof Error ? error : new Error(errorMessage));
    
    // Handle Firestore specific errors
    const isFirestoreError = error?.code && typeof error.code === 'string' && error.code.startsWith('firestore/');
    const isNetworkError = error?.code === 'unavailable' || 
                         error?.code === 'resource-exhausted' ||
                         error?.message?.includes('network');
    
    const statusCode = isNetworkError ? 503 : 500;
    const errorType = isNetworkError ? 'service_unavailable' : 
                     isFirestoreError ? 'database_error' : 'server_error';
    
    return new Response(JSON.stringify({ 
      error: isNetworkError ? 'Service Unavailable' : 'Internal Server Error',
      message: isNetworkError 
        ? 'The service is temporarily unavailable. Please try again later.' 
        : `An error occurred (${errorId})`,
      type: errorType,
      errorId,
      requestId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          code: error?.code,
          name: error?.name
        }
      })
    }), { 
      status: statusCode,
      headers: {
        ...COMMON_HEADERS,
        'Retry-After': isNetworkError ? '30' : undefined,
        'X-Request-ID': requestId,
        'X-Error-ID': errorId,
        'X-Error-Type': errorType
      }
    });
  }
}

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const auth = admin.auth();
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firestore
const db = getFirestore();

export async function POST(request: Request) {
  try {
    // Verify the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken.uid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { displayName, photoURL } = await request.json();
    const userId = decodedToken.uid;
    const batch = db.batch();
    let hasUpdates = false;

    // Update comments
    const commentsSnapshot = await db
      .collectionGroup('comments')
      .where('userId', '==', userId)
      .get();

    commentsSnapshot.forEach((doc: any) => {
      const updateData: any = {};
      if (displayName !== undefined) updateData.userDisplayName = displayName;
      if (photoURL !== undefined) updateData.userPhotoURL = photoURL;
      
      if (Object.keys(updateData).length > 0) {
        batch.update(doc.ref, updateData);
        hasUpdates = true;
      }
    });

    // Update posts
    const postsSnapshot = await db
      .collection('posts')
      .where('authorId', '==', userId)
      .get();

    postsSnapshot.forEach((doc: any) => {
      const updateData: any = {};
      if (displayName !== undefined) updateData['author.name'] = displayName;
      if (photoURL !== undefined) updateData['author.photoURL'] = photoURL;
      
      if (Object.keys(updateData).length > 0) {
        batch.update(doc.ref, updateData);
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      await batch.commit();
    }

    return NextResponse.json({ 
      success: true,
      updated: hasUpdates 
    });

  } catch (error) {
    console.error('Error updating user references:', error);
    
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user references',
        details: {
          message: errorMessage,
          stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
        }
      },
      { status: 500 }
    );
  }
}

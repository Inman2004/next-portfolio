import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { updateUserProfile } from '@/lib/updateUserProfile';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const auth = getAuth();

// Helper function to create consistent JSON responses
const jsonResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse(
        { success: false, error: 'Missing or invalid authorization header' },
        401
      );
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Verify the user is updating their own profile or is an admin
    if (decodedToken.uid !== params.id && decodedToken.email !== 'rvimman@gmail.com') {
      return jsonResponse(
        { success: false, error: 'Unauthorized to update this user' },
        403
      );
    }

    const { displayName, photoURL } = await request.json();
    
    if (!displayName && !photoURL) {
      return jsonResponse(
        { success: false, error: 'No fields to update' },
        400
      );
    }

    // Update both auth profile and Firestore data
    await updateUserProfile(params.id, {
      displayName: displayName || undefined,
      photoURL: photoURL || undefined
    });

    return jsonResponse({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: params.id,
        displayName,
        photoURL
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return jsonResponse(
      { 
        success: false, 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
}

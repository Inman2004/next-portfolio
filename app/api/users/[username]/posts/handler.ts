import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-server';
import { Timestamp } from 'firebase-admin/firestore';

const COMMON_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: COMMON_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400, headers: COMMON_HEADERS });
    }

    const usersRef = db.collection('users');
    const userQuery = usersRef.where('username', '==', username);
    const userSnapshot = await userQuery.get();

    if (userSnapshot.empty) {
      return NextResponse.json({ error: `User not found with username: ${username}` }, { status: 404, headers: COMMON_HEADERS });
    }

    const userId = userSnapshot.docs[0].id;

    const postsRef = db.collection('blogPosts');
    const postsQuery = postsRef
      .where('authorId', '==', userId)
      .where('published', '==', true)
      .orderBy('createdAt', 'desc');
    
    const postsSnapshot = await postsQuery.get();

    const posts = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
      };
    });

    return NextResponse.json({ success: true, posts }, { headers: COMMON_HEADERS });

  } catch (error) {
    console.error('API Error in user posts handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: COMMON_HEADERS }
    );
  }
}
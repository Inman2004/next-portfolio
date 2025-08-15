import { NextResponse } from 'next/server';
import { unsubscribeFromBlog } from '@/lib/membership';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blogId, email } = body;

    if (!blogId || !email) {
      return NextResponse.json(
        { error: 'Blog ID and email are required' },
        { status: 400 }
      );
    }

    // For unsubscribe, we don't require authentication since it's a public link
    // We'll use the email to find and deactivate the subscription
    const success = await unsubscribeFromBlogByEmail(blogId, email);

    if (success) {
      return NextResponse.json({
        message: 'Successfully unsubscribed from blog notifications',
        email,
        blogId
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to unsubscribe from blog notifications' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in blog unsubscribe route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to unsubscribe by email (for public unsubscribe links)
async function unsubscribeFromBlogByEmail(blogId: string, email: string): Promise<boolean> {
  try {
    const { db } = await import('@/lib/firebase-server');
    const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
    
    const subscriptionsRef = collection(db, 'blogSubscriptions');
    const q = query(
      subscriptionsRef,
      where('blogId', '==', blogId),
      where('email', '==', email),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    
    // Update all matching subscriptions to inactive
    const updatePromises = snapshot.docs.map(docRef => 
      updateDoc(docRef.ref, { isActive: false })
    );
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error unsubscribing by email:', error);
    return false;
  }
}

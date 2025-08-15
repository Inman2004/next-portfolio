import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication
    const { user } = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's blog subscriptions
    const { db } = await import('@/lib/firebase-server');
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const subscriptionsRef = collection(db, 'blogSubscriptions');
    const q = query(
      subscriptionsRef,
      where('userId', '==', user.uid)
    );
    
    const snapshot = await getDocs(q);
    const subscriptions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Enrich with blog and creator information
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          // Get blog post to find creator
          const { getBlogPost } = await import('@/lib/blogUtils');
          const blogPost = await getBlogPost(subscription.blogId);
          
          if (blogPost) {
            return {
              id: subscription.id,
              blogId: subscription.blogId,
              creatorName: blogPost.authorName || blogPost.author || 'Unknown Creator',
              email: subscription.email,
              isActive: subscription.isActive,
              createdAt: subscription.createdAt
            };
          } else {
            return {
              id: subscription.id,
              blogId: subscription.blogId,
              creatorName: 'Unknown Creator',
              email: subscription.email,
              isActive: subscription.isActive,
              createdAt: subscription.createdAt
            };
          }
        } catch (error) {
          console.error('Error enriching blog subscription:', error);
          return {
            id: subscription.id,
            blogId: subscription.blogId,
            creatorName: 'Unknown Creator',
            email: subscription.email,
            isActive: subscription.isActive,
            createdAt: subscription.createdAt
          };
        }
      })
    );

    return NextResponse.json({
      subscriptions: enrichedSubscriptions
    });

  } catch (error) {
    console.error('Error in blog user-subscriptions route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getUserSubscriptions } from '@/lib/membership';
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

    // Get user's subscriptions
    const subscriptions = await getUserSubscriptions(user.uid);
    
    // Enrich with creator information
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          // Get creator profile
          const { getCreatorProfile } = await import('@/lib/membership');
          const creatorProfile = await getCreatorProfile(subscription.creatorId);
          
          return {
            id: subscription.id,
            creatorId: subscription.creatorId,
            creatorName: creatorProfile?.displayName || 'Unknown Creator',
            creatorPhotoURL: creatorProfile?.photoURL,
            tier: subscription.tier,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate
          };
        } catch (error) {
          console.error('Error enriching subscription:', error);
          return {
            id: subscription.id,
            creatorId: subscription.creatorId,
            creatorName: 'Unknown Creator',
            creatorPhotoURL: undefined,
            tier: subscription.tier,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate
          };
        }
      })
    );

    return NextResponse.json({
      subscriptions: enrichedSubscriptions
    });

  } catch (error) {
    console.error('Error in user-subscriptions route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

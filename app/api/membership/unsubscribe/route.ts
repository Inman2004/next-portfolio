import { NextResponse } from 'next/server';
import { cancelSubscription } from '@/lib/membership';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Check authentication
    const { user } = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    const success = await cancelSubscription(user.uid, creatorId);

    if (success) {
      return NextResponse.json({
        message: 'Successfully unsubscribed from creator',
        subscription: { userId: user.uid, creatorId, status: 'cancelled' }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to unsubscribe from creator' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in membership unsubscribe route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { subscribeToCreator } from '@/lib/membership';
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
    const { creatorId, tier } = body;

    if (!creatorId || !tier) {
      return NextResponse.json(
        { error: 'Creator ID and tier are required' },
        { status: 400 }
      );
    }

    // Prevent self-subscription
    if (user.uid === creatorId) {
      return NextResponse.json(
        { error: 'Cannot subscribe to yourself' },
        { status: 400 }
      );
    }

    const success = await subscribeToCreator(user.uid, creatorId, tier);

    if (success) {
      return NextResponse.json({
        message: 'Successfully subscribed to creator',
        subscription: { userId: user.uid, creatorId, tier }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to subscribe to creator' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in membership subscribe route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

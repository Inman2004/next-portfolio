import { NextResponse } from 'next/server';
import { upsertCreatorProfile } from '@/lib/membership';
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
    const { userId, displayName, bio, membershipEnabled, membershipTiers } = body;

    if (!userId || !displayName) {
      return NextResponse.json(
        { error: 'User ID and display name are required' },
        { status: 400 }
      );
    }

    // Only allow users to create their own profile
    if (user.uid !== userId) {
      return NextResponse.json(
        { error: 'Can only create profile for yourself' },
        { status: 403 }
      );
    }

    const success = await upsertCreatorProfile(userId, {
      displayName,
      bio,
      membershipEnabled: membershipEnabled || false,
      membershipTiers: membershipTiers || []
    });

    if (success) {
      // Get the created profile
      const { getCreatorProfile } = await import('@/lib/membership');
      const profile = await getCreatorProfile(userId);
      
      return NextResponse.json({
        message: 'Creator profile created successfully',
        profile
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create creator profile' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in creator profile creation route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

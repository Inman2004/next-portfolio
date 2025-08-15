import { NextResponse } from 'next/server';
import { getCreatorProfile, upsertCreatorProfile } from '@/lib/membership';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get creator profile
    const profile = await getCreatorProfile(id);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Error in creator profile GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { user } = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Only allow users to update their own profile
    if (user.uid !== id) {
      return NextResponse.json(
        { error: 'Can only update your own profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { displayName, bio, membershipEnabled } = body;

    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    const success = await upsertCreatorProfile(id, {
      displayName,
      bio,
      membershipEnabled
    });

    if (success) {
      // Get the updated profile
      const profile = await getCreatorProfile(id);
      
      return NextResponse.json({
        message: 'Creator profile updated successfully',
        profile
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update creator profile' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in creator profile PUT route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

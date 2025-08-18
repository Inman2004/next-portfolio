import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase-server';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

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

    if (!creatorId || !tier || !tier.name || tier.price === undefined) {
      return NextResponse.json(
        { error: 'Creator ID, tier name, and price are required' },
        { status: 400 }
      );
    }

    // Only allow users to create tiers for themselves
    if (user.uid !== creatorId) {
      return NextResponse.json(
        { error: 'Can only create tiers for yourself' },
        { status: 403 }
      );
    }

    // Get creator profile
    const creatorRef = doc(db, 'creatorProfiles', creatorId);
    const creatorDoc = await getDoc(creatorRef);

    if (!creatorDoc.exists()) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      );
    }

    // Add new tier
    await updateDoc(creatorRef, {
      membershipTiers: arrayUnion(tier)
    });

    return NextResponse.json({
      message: 'Membership tier created successfully',
      tier
    });

  } catch (error) {
    console.error('Error in membership tier creation route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    if (!creatorId || !tier || !tier.id) {
      return NextResponse.json(
        { error: 'Creator ID and tier ID are required' },
        { status: 400 }
      );
    }

    // Only allow users to update tiers for themselves
    if (user.uid !== creatorId) {
      return NextResponse.json(
        { error: 'Can only update tiers for yourself' },
        { status: 403 }
      );
    }

    // Get creator profile
    const creatorRef = doc(db, 'creatorProfiles', creatorId);
    const creatorDoc = await getDoc(creatorRef);

    if (!creatorDoc.exists()) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      );
    }

    const currentProfile = creatorDoc.data();
    const updatedTiers = currentProfile.membershipTiers.map((t: any) => 
      t.id === tier.id ? tier : t
    );

    // Update tiers
    await updateDoc(creatorRef, {
      membershipTiers: updatedTiers
    });

    return NextResponse.json({
      message: 'Membership tier updated successfully',
      tier
    });

  } catch (error) {
    console.error('Error in membership tier update route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    const { creatorId, tierId } = body;

    if (!creatorId || !tierId) {
      return NextResponse.json(
        { error: 'Creator ID and tier ID are required' },
        { status: 400 }
      );
    }

    // Only allow users to delete tiers for themselves
    if (user.uid !== creatorId) {
      return NextResponse.json(
        { error: 'Can only delete tiers for yourself' },
        { status: 403 }
      );
    }

    // Get creator profile
    const creatorRef = doc(db, 'creatorProfiles', creatorId);
    const creatorDoc = await getDoc(creatorRef);

    if (!creatorDoc.exists()) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      );
    }

    const currentProfile = creatorDoc.data();
    const updatedTiers = currentProfile.membershipTiers.filter((t: any) => t.id !== tierId);

    // Update tiers
    await updateDoc(creatorRef, {
      membershipTiers: updatedTiers
    });

    return NextResponse.json({
      message: 'Membership tier deleted successfully'
    });

  } catch (error) {
    console.error('Error in membership tier deletion route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

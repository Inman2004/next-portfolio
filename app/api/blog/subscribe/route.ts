import { NextResponse } from 'next/server';
import { subscribeToBlog } from '@/lib/membership';
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
    const { blogId, email } = body;

    if (!blogId || !email) {
      return NextResponse.json(
        { error: 'Blog ID and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const success = await subscribeToBlog(user.uid, blogId, email);

    if (success) {
      return NextResponse.json({
        message: 'Successfully subscribed to blog notifications',
        subscription: { userId: user.uid, blogId, email }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to subscribe to blog notifications' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in blog subscribe route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { incrementViewCount } from '@/lib/views';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Increment the view count
    const newCount = await incrementViewCount(id);
    
    return NextResponse.json({
      success: true,
      newCount,
      message: 'View count incremented successfully'
    });

  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}

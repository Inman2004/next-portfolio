import { NextResponse } from 'next/server';
import { getBlogPost } from '@/lib/blogUtils';
import { incrementViewCount, getViewCount } from '@/lib/views';

export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the blog post
    const post = await getBlogPost(id);
    
    if (!post) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    // Increment view count
    await incrementViewCount(`blog:${id}`);
    
    // Get updated view count
    const views = await getViewCount(`blog:${id}`);
    
    return NextResponse.json({ 
      post: {
        ...post,
        // Convert Firestore Timestamp to ISO string for serialization
        createdAt: post.createdAt?.toDate().toISOString(),
      },
      views
    });
    
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

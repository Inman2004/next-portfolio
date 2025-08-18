import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/blogUtils';
import { getViewCounts } from '@/lib/views';

export const revalidate = 60;

export async function GET() {
  try {
    // Get all blog posts
    const posts = await getBlogPosts({ publishedOnly: true });
    
    // Get view counts for all posts
    const postIds = posts.map(post => post.id);
    const viewCounts = await getViewCounts(postIds);
    
    // Add view counts to posts
    const postsWithViews = posts.map(post => ({
      ...post,
      views: viewCounts[post.id] || 0,
      // Convert Firestore Timestamp to ISO string for serialization
      createdAt: post.createdAt?.toDate ? post.createdAt.toDate().toISOString() : post.createdAt,
    }));
    
    return NextResponse.json({ posts: postsWithViews });
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

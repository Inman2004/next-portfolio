import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase-server';
import { FieldValue } from 'firebase-admin/firestore';
import { getBlogPosts } from '@/lib/blogUtils';
import { getViewCounts } from '@/lib/views';
import { blogPostSchema } from '@/lib/schemas/blog';
import { calculateReadingTime } from '@/lib/readingTime';

export const revalidate = 60;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { user } = session;

    const json = await request.json();
    const parsedData = blogPostSchema.parse(json);

    const slug = parsedData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const readingTime = calculateReadingTime(parsedData.content).text;

    const postData = {
      ...parsedData,
      slug,
      readingTime,
      authorId: user.id,
      authorName: user.name || 'Anonymous',
      authorPhotoURL: user.image || null,
      viewCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('blogPosts').add(postData);

    return NextResponse.json({ id: docRef.id, ...postData }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const posts = await getBlogPosts({ publishedOnly: true });
    const postIds = posts.map(post => post.id);
    const viewCounts = await getViewCounts(postIds);

    const postsWithViews = posts.map(post => ({
      ...post,
      views: viewCounts[post.id] || 0,
    }));

    return NextResponse.json({ posts: postsWithViews });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
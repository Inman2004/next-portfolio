import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase-server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
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

    // Use a partial schema for creation, as some fields are generated on the server.
    const createSchema = blogPostSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      slug: true,
      readingTime: true,
      viewCount: true,
      authorId: true,
      authorName: true,
      authorPhotoURL: true,
    });

    const json = await request.json();
    const parsedData = createSchema.parse(json);

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

    const postsWithViews = posts.map(post => {
      const { createdAt, updatedAt, ...rest } = post;
      return {
        ...rest,
        views: viewCounts[post.id] || 0,
        createdAt: (createdAt instanceof Timestamp) ? createdAt.toDate().toISOString() : createdAt,
        updatedAt: (updatedAt instanceof Timestamp) ? updatedAt.toDate().toISOString() : updatedAt,
      };
    });

    return NextResponse.json({ posts: postsWithViews });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
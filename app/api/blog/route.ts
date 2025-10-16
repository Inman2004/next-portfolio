import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase-server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getBlogPosts, getViewCounts } from '@/lib/blogUtils';
import { blogPostSchema } from '@/lib/schemas/blog';
import { calculateReadingTime } from '@/lib/readingTime';

export const revalidate = 60;

export async function POST(request: Request) {
  console.log('Received blog post creation request');
  try {
    const session = await auth();
    console.log('Auth session:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.error('Unauthorized: No user session found');
      return new NextResponse(JSON.stringify({ 
        error: 'Unauthorized',
        message: 'You must be logged in to create a blog post' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { user } = session;
    console.log('User authenticated:', { userId: user.id, email: user.email });

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

    let json;
    try {
      json = await request.json();
      console.log('Received post data:', JSON.stringify(json, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new NextResponse(JSON.stringify({
        error: 'Invalid request body',
        message: 'Could not parse request body as JSON'
      }), { status: 400 });
    }

    let parsedData;
    try {
      parsedData = createSchema.parse(json);
      console.log('Validated post data:', JSON.stringify(parsedData, null, 2));
    } catch (validationError) {
      console.error('Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({
          error: 'Validation failed',
          issues: validationError.issues,
          message: 'Invalid blog post data'
        }), { status: 400 });
      }
      throw validationError;
    }

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

    console.log('Attempting to save to Firestore...');
    try {
      const docRef = await db.collection('blogPosts').add(postData);
      console.log('Blog post created successfully with ID:', docRef.id);
      
      // Convert Firestore timestamps to ISO strings for the response
      const responseData = {
        id: docRef.id,
        ...postData,
        createdAt: new Date().toISOString(), // Since we're using serverTimestamp
        updatedAt: new Date().toISOString()
      };
      
      return new NextResponse(JSON.stringify(responseData), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      throw firestoreError;
    }
  } catch (error: unknown) {
    console.error('Unexpected error in blog post creation:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.issues);
      return new NextResponse(JSON.stringify({
        error: 'Validation failed',
        message: 'Invalid blog post data',
        issues: error.issues,
        input: error.errors
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle Firestore errors
    const firestoreError = error as { code?: string; message?: string };
    if (firestoreError?.code) {
      console.error('Database error:', firestoreError.code, firestoreError.message);
      return new NextResponse(JSON.stringify({
        error: 'Database error',
        code: firestoreError.code,
        message: 'Failed to save blog post',
        details: process.env.NODE_ENV === 'development' ? firestoreError.message : undefined
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generic error response
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  try {
    const posts = await getBlogPosts({ publishedOnly: true });
    const postIds = posts.map(post => post.id);
    const viewCounts = await getViewCounts(postIds);

    const postsWithViews = posts.map((post: any) => {
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
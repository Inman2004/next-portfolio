import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/firebase-server';
import { FieldValue } from 'firebase-admin/firestore';
import { getBlogPost } from '@/lib/blogUtils';
import { incrementViewCount } from '@/lib/views';
import { blogPostSchema } from '@/lib/schemas/blog';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET handler for fetching a single blog post
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const post = await getBlogPost(id);

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }
    
    // Asynchronously increment view count. No need to await.
    incrementViewCount(id);

    return NextResponse.json(post);
  } catch (error) {
    console.error(`Error fetching post ${params.id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH handler for updating a blog post
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const postRef = db.collection('blogPosts').doc(id);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return new NextResponse('Post not found', { status: 404 });
    }

    const postData = postSnap.data();
    const isAuthor = postData?.authorId === session.user.id;
    const isAdmin = (session.user as any).role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const json = await request.json();
    const parsedData = blogPostSchema.partial().parse(json);
    
    const updateData = {
      ...parsedData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await postRef.update(updateData);

    return NextResponse.json({ message: 'Post updated successfully' });

  } catch (error) {
    console.error(`Error updating post ${params.id}:`, error);
     if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE handler for deleting a blog post
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const postRef = db.collection('blogPosts').doc(id);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return new NextResponse('Post not found', { status: 404 });
    }

    const postData = postSnap.data();
    const isAuthor = postData?.authorId === session.user.id;
    const isAdmin = (session.user as any).role === 'admin';

    if (!isAuthor && !isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (postData?.coverImage) {
      try {
        const publicIdWithFolder = postData.coverImage.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicIdWithFolder);
      } catch (e) {
        console.error("Error deleting cover image from Cloudinary, continuing...", e);
      }
    }

    await postRef.delete();

    return NextResponse.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error(`Error deleting post ${params.id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
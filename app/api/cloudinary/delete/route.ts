import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const { publicId } = await req.json();
    
    if (!publicId) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing publicId parameter' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the resource
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'not found') {
      return new NextResponse(
        JSON.stringify({ error: 'Image not found', publicId }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (result.result !== 'ok') {
      throw new Error(`Failed to delete image: ${result.result}`);
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Ensure this API route doesn't get cached
export const dynamic = 'force-dynamic';

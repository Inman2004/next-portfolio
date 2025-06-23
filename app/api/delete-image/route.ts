import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    console.log('=== DELETE IMAGE REQUEST ===');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { publicId } = body;
    
    if (!publicId) {
      console.error('Error: Missing publicId in request');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing publicId',
          receivedData: body
        },
        { status: 400 }
      );
    }

    console.log(`Attempting to delete image with publicId: ${publicId}`);
    
    // First, check if the resource exists
    try {
      const resource = await cloudinary.api.resource(publicId);
      console.log('Found resource to delete:', resource);
    } catch (resourceError) {
      console.error('Error fetching resource:', resourceError);
      // Continue with deletion attempt even if resource fetch fails
    }

    // Perform the deletion
    console.log('Sending delete request to Cloudinary...');
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true, // Invalidate CDN cache
      resource_type: 'image'
    });
    
    console.log('Cloudinary delete result:', result);
    
    if (result.result === 'not found') {
      console.warn(`Warning: Image with publicId ${publicId} was not found`);
      return NextResponse.json({
        success: false,
        error: 'Image not found',
        result
      }, { status: 404 });
    }
    
    if (result.result !== 'ok') {
      console.error('Unexpected result from Cloudinary:', result);
      throw new Error(`Unexpected result: ${result.result}`);
    }
    
    console.log(`Successfully deleted image: ${publicId}`);
    return NextResponse.json({ 
      success: true, 
      result,
      message: `Successfully deleted image: ${publicId}`
    });
    
  } catch (error) {
    console.error('Error in delete-image API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'UnknownError'
      },
      { status: 500 }
    );
  } finally {
    console.log('=== END DELETE IMAGE REQUEST ===\n');
  }
}

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@/lib/auth';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    // Temporarily disable auth for debugging
    // const session = await auth();
    // if (!session) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }


    console.log('Cloudinary sign request received');
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { timestamp, folder, transformation, tags } = body;
    
    if (!timestamp) {
      const errorMsg = 'Missing required parameter: timestamp';
      console.error(errorMsg);
      return new NextResponse(JSON.stringify({ 
        error: errorMsg,
        received: { timestamp, folder, transformation, tags }
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify required environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      'NEXT_PUBLIC_CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      const errorMsg = `Missing required environment variables: ${missingEnvVars.join(', ')}`;
      console.error(errorMsg);
      return new NextResponse(JSON.stringify({ error: errorMsg }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare parameters for signature - must match exactly what will be in the upload request
    const params: Record<string, any> = {
      timestamp: timestamp.toString(),
      folder: folder || undefined,
      transformation: transformation || undefined,
      tags: tags || 'profile,user-avatar',
      context: 'alt=Profile image'
    };

    // Remove undefined values as they can cause signature mismatches
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    console.log('Parameters being signed:', JSON.stringify(params, null, 2));

    console.log('Generating signature with params:', JSON.stringify(params, null, 2));
    
    // Generate signature using Cloudinary's utility
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET || ''
    );
    
    console.log('Generated signature parameters:', Object.keys(params).join(','));

    console.log('Generated signature:', signature);

    const response = {
      signature,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      timestamp,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    
    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating Cloudinary signature:', errorMessage, error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to generate upload signature',
      details: errorMessage
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const dynamic = 'force-dynamic';

import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicId, resourceType = 'image' } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'publicId is required' });
    }

    // Delete the resource from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // Invalidate CDN cache
    });

    console.log('Cloudinary delete result:', result);

    if (result.result === 'not found') {
      // It's okay if the image wasn't found (might be first upload)
      return res.status(200).json({ success: true, message: 'No image to delete' });
    }

    if (result.result !== 'ok') {
      throw new Error(`Failed to delete image: ${result.result}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return res.status(500).json({ 
      error: 'Failed to delete image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

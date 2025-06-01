import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

export async function deleteImageFromCloudinary(imageUrl: string) {
  try {
    if (!imageUrl) return null;
    
    // Extract public_id from URL
    const publicId = imageUrl.split('/').pop()?.split('.')[0];
    if (!publicId) return null;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return null;
  }
}

interface CloudinaryPresets {
  default: string;
  profile: string;
  blog: string;
  [key: string]: string; // For dynamic access
}

export const cloudinaryPresets: CloudinaryPresets = {
  default: 'default',
  profile: 'profile-images',  // Must match exactly with Cloudinary dashboard
  blog: 'blog-covers',         // Must match exactly with Cloudinary dashboard
};

// Helper function to get folder based on preset
export const getFolderByPreset = (preset: string): string => {
  switch (preset) {
    case 'profile-images':
      return 'profile-images';
    case 'blog-covers':
      return 'blog-covers';
    default:
      return 'uploads';
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',  // For Cloudinary images
      'lh3.googleusercontent.com',  // For Google profile pictures
    ],
  },
}

module.exports = nextConfig 
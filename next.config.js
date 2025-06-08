/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: [
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'm.media-amazon.com',
      'resizing.flixster.com',
      'www.peacocktv.com',
      'images.justwatch.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Only configure Webpack if not using Turbopack
  webpack: process.env.TURBOPACK ? undefined : (config, { isServer, dev }) => {
    // Add custom webpack configurations if needed
    return config;
  },
  
  // Linting and TypeScript
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Only add Turbopack configuration if using Turbopack
if (process.env.TURBOPACK) {
  // Turbopack configuration (stable API in Next.js 15+)
  nextConfig.turbopack = {
    // Turbopack configuration options
    // Add any Turbopack specific configurations here
  };
}

module.exports = nextConfig;
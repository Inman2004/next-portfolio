/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Webpack configuration for Node.js polyfills and server-only modules
  webpack: (config, { isServer, webpack }) => {
    // Fix for Node.js polyfills in webpack 5
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        querystring: false,
        events: false,
        buffer: require.resolve('buffer/'),
      };
    }

    // Handle server-only modules
    if (isServer) {
      config.externals.push({
        'firebase-admin': 'firebase-admin',
        'lru-memoizer': 'lru-memoizer',
      });
    } else {
      // For client-side builds, mark server modules as external
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
        'lru-memoizer': 'commonjs lru-memoizer',
      });
    }

    // Add buffer polyfill
    config.plugins.push(
      new webpack.DefinePlugin({
        'global.Buffer': 'global.Buffer || undefined',
      })
    );

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
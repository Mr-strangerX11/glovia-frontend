/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1600],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'backend-glovia.vercel.app',
      },
      {
        protocol: 'http',
        hostname: 'backend-glovia.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'glovia.com.np',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'd2731avvelbbmh.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'da052c6adely1.cloudfront.net',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.glovia.com.np' }],
        destination: 'https://glovia.com.np/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Combine `remotePatterns` and `domains`
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
    ],
    domains: ['res.cloudinary.com'], // Add additional domains
    minimumCacheTTL: 60, // Use cache TTL from the second config
  },

  compress: true, // Enable compression
  poweredByHeader: false, // Disable the `x-powered-by` header
  generateEtags: true, // Enable ETags
  reactStrictMode: true, // Enable strict mode
  experimental: {
    serverActions: {}, // Enable Server Actions
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production
  },
};

export default nextConfig;

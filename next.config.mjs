/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.pexels.com',
          port: '', // Leave empty unless a specific port is needed
          pathname: '/**', // Match all paths under this domain
        },
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          port: '',
          pathname: '/**', // Match all paths under this domain
        },
        {
            protocol: 'https',
            hostname: "img.clerk.com",
            port: '',
            pathname: '/**', // Match all paths under this domain
          },
      ],
    },
  };
  
  export default nextConfig;
  
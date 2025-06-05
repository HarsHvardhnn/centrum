/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'your-backend-domain.com'], // Add your backend domain
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/:path*`, // Proxy to Backend
      },
    ];
  },
  experimental: {
    appDir: true, // Enable app directory for React Server Components
  },
};

module.exports = nextConfig; 
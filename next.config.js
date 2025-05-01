/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
        pathname: '/cdn/**',
      },
      {
        protocol: 'https',
        hostname: 'img.spoonacular.com',
        pathname: '/recipes/**',
      }
    ],
  },
};

module.exports = nextConfig; 
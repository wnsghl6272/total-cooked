/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Disable image optimization for external URLs to prevent DNS issues
    unoptimized: false,
    // Add loader configuration for better handling
    loader: 'default',
    // Increase timeout for external images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dalleprodsec.blob.core.windows.net',
        port: '',
        pathname: '/**',
      }
    ],
    // Handle image loading failures gracefully
    domains: [], // Keep empty to use remotePatterns
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  }
};

module.exports = nextConfig; 
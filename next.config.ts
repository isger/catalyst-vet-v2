import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nttivargznlzofkcbqtn.supabase.co',
        pathname: '/**',
      },
    ],
  },
  
  // Enable experimental features for subdomain support and performance
  experimental: {
    // Allow dynamic imports for server-side tenant resolution
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr'],
    // Enable performance optimizations
    optimisticClientCache: true,
  },
  
  // Configure hostname rewrites for development
  async rewrites() {
    return {
      beforeFiles: [
        // Handle subdomain routing in development
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>.*)\\.localhost:3000',
            },
          ],
          destination: '/:path*',
        },
      ],
    }
  },
  
  // Configure headers for tenant context
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
};

export default nextConfig;

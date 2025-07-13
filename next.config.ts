import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Enable experimental features for subdomain support
  experimental: {
    // Allow dynamic imports for server-side tenant resolution
    optimizePackageImports: ['@supabase/supabase-js']
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

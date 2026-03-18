import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }

    return [
      {
        source: '/docs',
        destination: 'http://127.0.0.1:3001/docs',
        permanent: false,
      },
      {
        source: '/docs/:path*',
        destination: 'http://127.0.0.1:3001/docs/:path*',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;

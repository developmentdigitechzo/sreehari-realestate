import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    qualities: [75, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "giving-amethyst-anteater.172-235-18-108.cpanel.site",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "giving-amethyst-anteater.172-235-18-108.cpanel.site",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const backendPort = process.env.BACKEND_PORT || '5000';
    const backendHost = process.env.BACKEND_HOST || 'http://127.0.0.1';
    const backendTarget = process.env.BACKEND_URL || `${backendHost}:${backendPort}`;

    return [
      {
        source: '/uploads/:path*',
        destination: `${backendTarget}/uploads/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

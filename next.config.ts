import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/chronas/:path*',
        destination: 'https://api.chronas.org/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
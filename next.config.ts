import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/platform',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


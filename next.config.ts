import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // basePath: '/platform', // disabled for local development
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


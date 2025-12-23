import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Required for GitHub Pages static export to ./out
  // basePath: '/platform', // disabled for local development
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


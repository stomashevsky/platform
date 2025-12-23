import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Required for GitHub Pages static export to ./out
  basePath: '/platform', // Required for GitHub Pages at stomashevsky.github.io/platform/
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to prevent deployment failures on Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

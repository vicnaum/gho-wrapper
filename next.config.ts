import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Optimizes the build for production
  poweredByHeader: false, // Removes the X-Powered-By header
  reactStrictMode: true,
};

export default nextConfig;

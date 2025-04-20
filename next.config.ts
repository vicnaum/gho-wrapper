import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Optimizes the build for production
  poweredByHeader: false, // Removes the X-Powered-By header
  reactStrictMode: true,
  swcMinify: true, // Uses SWC for minification instead of Terser
};

export default nextConfig;

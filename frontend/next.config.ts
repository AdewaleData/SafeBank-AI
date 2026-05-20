import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      console.log("[SafeBank] Webpack dev cache disabled to reduce disk writes");
    }
    return config;
  },
};

export default nextConfig;

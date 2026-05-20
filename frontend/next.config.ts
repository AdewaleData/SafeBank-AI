import type { NextConfig } from "next";
import path from "path";

// Monorepo tracing only when building from repo root locally; skip on Vercel (root = frontend).
const monorepoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  ...(process.env.VERCEL
    ? {}
    : { outputFileTracingRoot: monorepoRoot }),
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      console.log("[SafeBank] Webpack dev cache disabled to reduce disk writes");
    }
    return config;
  },
};

export default nextConfig;

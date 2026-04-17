import type { NextConfig } from "next";

// Use static export for Tauri, standalone for Docker/web
const isTauri = process.env.TAURI_BUILD === "1";

const nextConfig: NextConfig = {
  output: isTauri ? "export" : "standalone",
  images: { unoptimized: true },
  // Static export cannot have API routes — Tauri uses native Rust commands instead
  ...(isTauri ? {} : {}),
  turbopack: {},
};

export default nextConfig;


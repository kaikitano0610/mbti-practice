import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  devIndicators: false,
  eslint: {
    // ビルド時のESLintチェックを無視する
    ignoreDuringBuilds: true,
  },
  
  // TypeScriptのエラーも無視したい場合はこれも追加
  typescript: {
    ignoreBuildErrors: true,
  },
  
} as NextConfig;

export default nextConfig;

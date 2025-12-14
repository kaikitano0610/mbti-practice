import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  
};

export default nextConfig;

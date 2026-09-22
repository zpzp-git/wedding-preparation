import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;

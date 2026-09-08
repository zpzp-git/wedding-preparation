import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;

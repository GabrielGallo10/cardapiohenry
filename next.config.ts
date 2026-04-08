import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite otimização/remota se passares a usar next/image com URLs do R2.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

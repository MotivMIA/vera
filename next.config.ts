import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hosted Clerk FAPI only — ignore accidental Vercel NEXT_PUBLIC_CLERK_PROXY_URL at build.
  env: {
    NEXT_PUBLIC_CLERK_PROXY_URL: "",
  },
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

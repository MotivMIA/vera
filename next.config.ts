import type { NextConfig } from "next";

// Hosted Clerk FAPI only — never bake /__clerk proxy into client bundles.
delete process.env.NEXT_PUBLIC_CLERK_PROXY_URL;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PROXY_URL: "",
  },
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.NEXT_PUBLIC_CLERK_PROXY_URL": JSON.stringify(""),
      }),
    );
    return config;
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

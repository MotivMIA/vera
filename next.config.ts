import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { applyResolvedClerkEnv, getClerkPublishableKey } from "./lib/clerk/keys";

applyResolvedClerkEnv();
const resolvedClerkPublishableKey = getClerkPublishableKey();

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: resolvedClerkPublishableKey,
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

export default withNextIntl(nextConfig);

import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { clerkAppearance } from "@/lib/clerk/appearance";
import { getClerkProviderProxyProps } from "@/lib/clerk/hosted-only";
import { collectClerkOrigins } from "@/lib/clerk/origins";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visual Era | Creator Onboarding",
  description: "Professional creator onboarding, identity verification, and management tools.",
  metadataBase: new URL(getSiteUrl()),
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const allowedRedirectOrigins = collectClerkOrigins();

  return (
    <ClerkProvider
      {...getClerkProviderProxyProps()}
      appearance={clerkAppearance}
      allowedRedirectOrigins={allowedRedirectOrigins}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" className="dark">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

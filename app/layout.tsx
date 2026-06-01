import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { clerkAppearance } from "@/lib/clerk/appearance";
import { getClerkProviderProxyProps } from "@/lib/clerk/hosted-only";
import { getClerkPublishableKey } from "@/lib/clerk/keys";
import { collectClerkOrigins } from "@/lib/clerk/origins";
import { brandDisplayFont } from "@/lib/brand/fonts";
import { getSiteUrl } from "@/lib/env";
import { authSignInPath, authSignUpPath } from "@/lib/routes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visual Era | Creator Onboarding",
  description: "Build the presence, trust, and momentum your brand was made for.",
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
      publishableKey={getClerkPublishableKey()}
      {...getClerkProviderProxyProps()}
      appearance={clerkAppearance}
      allowedRedirectOrigins={allowedRedirectOrigins}
      signInUrl={authSignInPath()}
      signUpUrl={authSignUpPath()}
    >
      <html lang="en" className={`dark ${brandDisplayFont.variable}`}>
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

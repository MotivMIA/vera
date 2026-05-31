import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { CLERK_PROVIDER_PROXY_PROPS } from "@/lib/clerk/hosted-only";
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
      {...CLERK_PROVIDER_PROXY_PROPS}
      appearance={{
        variables: {
          colorBackground: "#0d0f13",
          colorText: "#f6f4ef",
          colorPrimary: "#d8b56d",
          borderRadius: "0.75rem",
        },
        elements: {
          cardBox: "shadow-none border border-white/10",
          formButtonPrimary: "bg-[#f7f3ea] text-[#090a0d] hover:bg-white",
        },
      }}
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

import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { CLERK_HOSTED_PROVIDER_PROPS } from "@/lib/clerk/hosted-only";
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
  const allowedRedirectOrigins = Array.from(
    new Set(
      [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        getSiteUrl(),
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        process.env.VERCEL_BRANCH_URL
          ? process.env.VERCEL_BRANCH_URL.startsWith("http")
            ? process.env.VERCEL_BRANCH_URL
            : `https://${process.env.VERCEL_BRANCH_URL}`
          : null,
      ]
        .filter(Boolean)
        .map((value) => {
          try {
            return new URL(value as string).origin;
          } catch {
            return value as string;
          }
        }),
    ),
  );

  return (
    <ClerkProvider
      {...CLERK_HOSTED_PROVIDER_PROPS}
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

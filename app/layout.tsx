import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visual Era | Creator Onboarding",
  description: "Professional creator onboarding, identity verification, and management tools.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
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

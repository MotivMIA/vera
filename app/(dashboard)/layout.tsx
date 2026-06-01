import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { DASHBOARD_ROUTES } from "@/lib/dashboard/constants";
import { getPreferredLocale } from "@/lib/i18n/preferred-locale";
import { authSignInPath } from "@/lib/routes";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) {
    const locale = await getPreferredLocale();
    redirect(`${authSignInPath(locale)}?redirect_url=${encodeURIComponent(DASHBOARD_ROUTES.creator)}`);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 px-5 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandLogo href="/" size="sm" showWordmark />
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${await getPreferredLocale()}`}>Back to site</Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}

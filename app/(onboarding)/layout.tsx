import { UnprefixedIntlProvider } from "@/components/i18n/unprefixed-intl-provider";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function OnboardingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <UnprefixedIntlProvider>
      <div className="relative flex min-h-screen flex-col">
        <div className="brand-page-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative flex-1">{children}</div>
        <SiteFooter />
      </div>
    </UnprefixedIntlProvider>
  );
}

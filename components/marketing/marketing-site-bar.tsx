import { getTranslations } from "next-intl/server";
import { FooterDisclaimerRow } from "@/components/marketing/footer-disclaimer-row";
import { contentShellClass } from "@/lib/brand/theme-classes";
import { buildFooterLegalLinks } from "@/lib/marketing/footer-config";
import { cn } from "@/lib/utils";

/** Slim bar for app login/auth — disclaimer band only (no marketing columns). */
export async function MarketingSiteBar({ className }: { className?: string }) {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-border-default", className)}>
      <div className={cn(contentShellClass, "px-5 py-6 md:px-8")}>
        <FooterDisclaimerRow
          columnCount={1}
          legal={buildFooterLegalLinks(t)}
          disclaimer={t("disclaimer")}
          copyright={t("copyright", { year })}
        />
      </div>
    </footer>
  );
}

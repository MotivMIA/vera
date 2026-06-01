import { getTranslations } from "next-intl/server";
import { FooterLanguageSelector } from "@/components/marketing/footer-language-selector";

export async function FooterDisclaimerRow() {
  const t = await getTranslations("Footer");
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-6 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-xs leading-relaxed text-muted-foreground md:flex-nowrap">
      <span>{t("copyright", { year: currentYear })}</span>
      <span aria-hidden>·</span>
      <span>{t("disclaimer")}</span>
      <span aria-hidden className="hidden sm:inline">
        ·
      </span>
      <FooterLanguageSelector className="justify-center" />
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { LandingFooter } from "@/components/marketing/landing/landing-footer";
import { buildMarketingFooterColumns } from "@/components/marketing/marketing-footer-columns";
import { buildFooterLegalLinks } from "@/lib/marketing/footer-config";
import { SOCIAL_LINKS } from "@/lib/brand/social";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const tCols = await getTranslations("CrmLanding");
  const year = new Date().getFullYear();

  return (
    <LandingFooter
      variant="site"
      tagline={tCols("footer.tagline")}
      columns={buildMarketingFooterColumns(tCols)}
      copyright={t("copyright", { year })}
      socialLinks={SOCIAL_LINKS}
      appSection={{ title: t("downloadApp") }}
      disclaimer={t("disclaimer")}
      legal={buildFooterLegalLinks(t)}
    />
  );
}

import { FOOTER_LEGAL_SLUGS } from "@/lib/brand/social";
import { isLegalSlug } from "@/lib/legal/documents";

export type FooterLegalLink = { label: string; href: string };

type FooterLegalTranslator = (key: "terms" | "privacy") => string;

/** Terms + Privacy links for the footer disclaimer band (single source of truth). */
export function buildFooterLegalLinks(t: FooterLegalTranslator): FooterLegalLink[] {
  return FOOTER_LEGAL_SLUGS.map((slug) => {
    if (!isLegalSlug(slug)) {
      throw new Error(`Missing footer legal document: ${slug}`);
    }
    const label = slug === "terms" ? t("terms") : t("privacy");
    return { label, href: `/legal/${slug}` };
  });
}

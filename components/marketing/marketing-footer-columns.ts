import type { FooterColumn } from "@/components/marketing/landing/landing-footer";

const productIndices = [0, 2, 3] as const;
const supportIndices = [0, 2] as const;

type ColumnTranslator = (
  key:
    | "footer.product"
    | "footer.support"
    | `footer.productLinks.${(typeof productIndices)[number]}.label`
    | `footer.productLinks.${(typeof productIndices)[number]}.href`
    | `footer.supportLinks.${(typeof supportIndices)[number]}.label`
    | `footer.supportLinks.${(typeof supportIndices)[number]}.href`,
) => string;

/** Nav link columns shared by CRM landing and SiteFooter (minimal, live routes only). */
export function buildMarketingFooterColumns(t: ColumnTranslator): FooterColumn[] {
  return [
    {
      title: t("footer.product"),
      links: productIndices.map((i) => ({
        label: t(`footer.productLinks.${i}.label`),
        href: t(`footer.productLinks.${i}.href`),
      })),
    },
    {
      title: t("footer.support"),
      links: supportIndices.map((i) => ({
        label: t(`footer.supportLinks.${i}.label`),
        href: t(`footer.supportLinks.${i}.href`),
      })),
    },
  ];
}

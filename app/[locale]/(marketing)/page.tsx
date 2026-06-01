import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OfmMarketingPage } from "@/components/marketing/ofm-marketing-page";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "OfmMarketing" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function HomePage() {
  return <OfmMarketingPage />;
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CrmLandingPage } from "@/components/marketing/crm-landing-page";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "CrmLanding" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function HomePage() {
  return <CrmLandingPage />;
}

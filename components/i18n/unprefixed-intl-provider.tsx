import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { SetHtmlLang } from "@/components/i18n/set-html-lang";
import { getPreferredLocale } from "@/lib/i18n/preferred-locale";

/** next-intl for routes outside `app/[locale]` (onboarding, dashboard). */
export async function UnprefixedIntlProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getPreferredLocale();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SetHtmlLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}

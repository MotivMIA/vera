import { SiteFooter } from "@/components/marketing/site-footer";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

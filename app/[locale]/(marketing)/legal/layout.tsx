import { SiteFooter } from "@/components/marketing/site-footer";

export default function LegalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

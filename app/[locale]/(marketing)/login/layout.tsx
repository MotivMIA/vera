import { MarketingSiteBar } from "@/components/marketing/marketing-site-bar";

export default function AppLoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      <MarketingSiteBar />
    </div>
  );
}

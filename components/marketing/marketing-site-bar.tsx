import { FooterDisclaimerRow } from "@/components/marketing/footer-disclaimer-row";
import { contentShellClass } from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

/** Slim bar for app login/auth — disclaimer + language only (no marketing columns). */
export function MarketingSiteBar({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-border-default", className)}>
      <div className={cn(contentShellClass, "px-5 py-6 md:px-8")}>
        <FooterDisclaimerRow />
      </div>
    </footer>
  );
}

import type { LucideIcon } from "lucide-react";
import { panelShellClass } from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

export type MarketingFeatureItemProps = {
  icon: LucideIcon;
  title: string;
  body: string;
  className?: string;
};

export function MarketingFeatureItem({ icon: Icon, title, body, className }: MarketingFeatureItemProps) {
  return (
    <article
      className={cn(
        panelShellClass,
        "flex min-w-0 flex-col gap-3 transition duration-300 hover:border-border-accent-hover hover:bg-surface-panel-hover",
        className,
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border-accent bg-surface-accent-muted text-accent">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

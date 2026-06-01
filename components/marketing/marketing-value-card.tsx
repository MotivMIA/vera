import type { LucideIcon } from "lucide-react";
import { MarketingValueArt, type ValueArtVariant } from "@/components/marketing/marketing-art";
import { panelShellClass } from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

export type MarketingValueCardProps = {
  artVariant: ValueArtVariant;
  icon: LucideIcon;
  title: string;
  body: string;
};

export function MarketingValueCard({ artVariant, icon: Icon, title, body }: MarketingValueCardProps) {
  return (
    <article
      className={cn(
        panelShellClass,
        "group overflow-hidden p-0 transition duration-300 hover:border-border-accent-hover hover:shadow-[var(--shadow-glow)]",
      )}
    >
      <div className="relative isolate aspect-[16/10] min-h-[10rem] w-full overflow-hidden">
        <MarketingValueArt variant={artVariant} />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-background/92 via-background/20 to-transparent"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      </div>
      <div className="space-y-3 px-fluid-inline pb-fluid-card-y pt-4 text-center md:text-left">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-border-accent bg-surface-accent-muted text-accent transition group-hover:border-border-accent-strong group-hover:bg-surface-panel-emphasis md:mx-0">
          <Icon className="size-5" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}

import { panelShellClass } from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

export type MarketingQuoteCardProps = {
  quote: string;
  attribution: string;
  className?: string;
};

export function MarketingQuoteCard({ quote, attribution, className }: MarketingQuoteCardProps) {
  return (
    <figure
      className={cn(
        panelShellClass,
        "relative min-w-0 overflow-hidden text-left before:pointer-events-none before:absolute before:inset-y-4 before:left-0 before:w-0.5 before:rounded-full before:bg-gradient-to-b before:from-accent/70 before:to-[var(--brand-purple-deep)]/50",
        className,
      )}
    >
      <blockquote className="text-sm leading-7 text-foreground">&ldquo;{quote}&rdquo;</blockquote>
      <figcaption className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {attribution}
      </figcaption>
    </figure>
  );
}

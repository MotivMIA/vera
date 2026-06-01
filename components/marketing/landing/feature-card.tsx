import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const accentBg = {
  peach: "bg-[var(--landing-accent-peach)]",
  blue: "bg-[var(--landing-accent-blue)]",
  green: "bg-[var(--landing-accent-green)]",
  lavender: "bg-[var(--landing-accent-lavender)]",
  warm: "bg-[var(--landing-accent-warm)]",
  none: "bg-[var(--landing-surface-muted)]",
} as const;

export type FeatureCardAccent = keyof typeof accentBg;

type FeatureCardProps = {
  title: string;
  body: string;
  icon?: LucideIcon;
  accent?: FeatureCardAccent;
  className?: string;
  compact?: boolean;
};

export function FeatureCard({
  title,
  body,
  icon: Icon,
  accent = "none",
  className,
  compact,
}: FeatureCardProps) {
  return (
    <article className={cn("landing-card min-w-0 p-5 md:p-6", compact && "p-4", className)}>
      {Icon ? (
        <span
          className={cn(
            "mb-4 inline-flex size-10 items-center justify-center rounded-xl",
            accentBg[accent],
          )}
          aria-hidden
        >
          <Icon className="size-5 text-[var(--landing-text)]" strokeWidth={1.75} />
        </span>
      ) : null}
      <h3
        className={cn(
          "font-bold text-[var(--landing-text)]",
          compact ? "text-sm" : "text-base md:text-lg",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-2 landing-subhead",
          compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed",
        )}
      >
        {body}
      </p>
    </article>
  );
}

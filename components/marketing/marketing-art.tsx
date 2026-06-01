import { cn } from "@/lib/utils";

export type ValueArtVariant = "growth" | "trust" | "creators";

const valueGradients: Record<ValueArtVariant, { a: string; b: string; c: string }> = {
  growth: {
    a: "color-mix(in srgb, var(--color-accent) 55%, transparent)",
    b: "color-mix(in srgb, var(--color-accent-secondary) 35%, transparent)",
    c: "color-mix(in srgb, var(--color-accent-hover) 20%, transparent)",
  },
  trust: {
    a: "color-mix(in srgb, var(--color-accent-secondary) 50%, transparent)",
    b: "color-mix(in srgb, var(--color-accent) 28%, transparent)",
    c: "color-mix(in srgb, var(--color-accent-deep) 35%, transparent)",
  },
  creators: {
    a: "color-mix(in srgb, var(--color-accent-hover) 35%, transparent)",
    b: "color-mix(in srgb, var(--color-accent) 40%, transparent)",
    c: "color-mix(in srgb, var(--color-accent-secondary) 45%, transparent)",
  },
};

/** Abstract pillar art — no stock photos; pairs with value cards. */
export function MarketingValueArt({
  variant,
  className,
}: {
  variant: ValueArtVariant;
  className?: string;
}) {
  const g = valueGradients[variant];

  return (
    <div
      className={cn("relative size-full overflow-hidden bg-[var(--color-bg-soft)]", className)}
      aria-hidden
    >
      <div
        className="absolute -left-1/4 top-1/4 size-[70%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${g.a} 0%, transparent 70%)` }}
      />
      <div
        className="absolute -right-1/4 bottom-0 size-[65%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${g.b} 0%, transparent 68%)` }}
      />
      <div
        className="absolute left-1/2 top-1/2 size-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${g.c} 0%, transparent 72%)` }}
      />
      <svg
        className="absolute inset-0 size-full opacity-[0.14]"
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${variant}`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="var(--color-text)"
              strokeOpacity="0.35"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${variant})`} />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-soft)] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,var(--color-accent-soft),transparent)]" />
    </div>
  );
}

/** Decorative frame glow behind hero / feature visuals. */
export function MarketingVisualFrame({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -inset-px rounded-[1.05rem] opacity-80",
        "bg-gradient-to-br from-accent/50 via-transparent to-[var(--color-accent-secondary)]/40",
        className,
      )}
      aria-hidden
    />
  );
}

/** CSS-only ambient for auth column — stacks under optional photo. */
export function MarketingAuthAmbientArt({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-full overflow-hidden bg-background", className)} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_0%_50%,var(--color-accent-glow),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_30%,color-mix(in_srgb,var(--color-accent-secondary)_22%,transparent),transparent_50%)]" />
      <div className="absolute left-[20%] top-[25%] size-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-[15%] right-[10%] size-56 rounded-full bg-[var(--color-accent-secondary)]/25 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(color-mix(in_srgb,var(--color-text)_90%,transparent)_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
    </div>
  );
}

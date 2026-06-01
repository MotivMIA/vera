import { MarketingPhoto } from "@/components/marketing/marketing-photo";
import { MarketingVisualFrame } from "@/components/marketing/marketing-art";
import { cn } from "@/lib/utils";

export type MarketingVisualProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** Dark gradient overlay for text legibility on photos. */
  overlay?: "hero" | "card" | "ambient" | "none";
  /** Magenta rim glow + gradient border (hero / feature shots). */
  glow?: boolean;
};

const overlayClass = {
  hero: "bg-gradient-to-t from-background via-background/45 to-background/5",
  card: "bg-gradient-to-t from-background/95 via-background/30 to-transparent",
  ambient: "bg-gradient-to-r from-background via-background/88 to-background/35",
  none: "",
} as const;

export function MarketingVisual({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  overlay = "hero",
  glow = false,
}: MarketingVisualProps) {
  return (
    <div
      className={cn(
        "marketing-visual-rise relative isolate overflow-hidden rounded-2xl border border-border-default bg-surface-panel shadow-[var(--shadow-glow)]",
        glow && "ring-1 ring-accent/20",
        className,
      )}
    >
      {glow ? <MarketingVisualFrame /> : null}
      <div className="absolute inset-0 size-full">
        <MarketingPhoto src={src} alt={alt} priority={priority} imgClassName={imageClassName} />
      </div>
      {overlay !== "none" ? (
        <div className={cn("pointer-events-none absolute inset-0 z-[1]", overlayClass[overlay])} aria-hidden />
      ) : null}
      {glow ? (
        <div
          className="pointer-events-none absolute -bottom-8 left-1/2 z-[2] h-16 w-3/4 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

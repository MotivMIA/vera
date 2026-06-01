import Image from "next/image";
import Link from "next/link";
import { brandWordmarkClass } from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

/**
 * Mark-only sizes (no wordmark). Lockups: globals sets --lockup-wordmark-size;
 * mark = wordmark × --lockup-mark-ratio (fluid-metrics.css).
 */
const sizeMap = {
  sm: {
    width: 28,
    height: 28,
    className: "size-7",
    wordmark: "brand-wordmark--sm",
    gap: "gap-2",
  },
  md: {
    width: 35,
    height: 35,
    className: "size-[2.1875rem]",
    wordmark: "brand-wordmark--md",
    gap: "gap-2.5",
  },
  lg: {
    width: 85,
    height: 85,
    className: "size-[3.0625rem]",
    wordmark: "brand-wordmark--lg",
    gap: "gap-2.5",
  },
  xl: {
    width: 63,
    height: 63,
    className: "size-[3.9375rem]",
    wordmark: "brand-wordmark--xl",
    gap: "gap-3",
  },
  "2xl": {
    width: 85,
    height: 85,
    className: "size-[5.3125rem]",
    wordmark: "brand-wordmark--2xl",
    gap: "gap-3.5",
  },
} as const;

export type BrandLogoProps = {
  /** When set, wraps the logo in a link. Omit for a static logo (e.g. inside another link). */
  href?: string | null;
  size?: keyof typeof sizeMap;
  showWordmark?: boolean;
  className?: string;
  priority?: boolean;
  /**
   * `mask` — PNG alpha silhouette filled with `--brand-gradient` (default; palette-driven).
   * `png` — baked raster colors from public/brand/logo.png (OG/email parity, legacy).
   */
  variant?: "mask" | "png";
};

export function BrandLogo({
  href,
  size = "md",
  showWordmark = false,
  className,
  priority = false,
  variant = "mask",
}: BrandLogoProps) {
  const dimensions = sizeMap[size];
  const markClassName = showWordmark
    ? "brand-logo-mark shrink-0"
    : cn(dimensions.className, "brand-logo-mark shrink-0");

  const mark =
    variant === "png" ? (
      <Image
        src="/brand/logo.png"
        alt=""
        width={dimensions.width}
        height={dimensions.height}
        className={cn(markClassName, "brand-logo-mark-png", !showWordmark && "object-contain")}
        priority={priority}
        aria-hidden
      />
    ) : (
      <span
        role="img"
        aria-label="Visual Era"
        className={markClassName}
      />
    );

  const content = (
    <span
      className={cn(
        showWordmark ? "brand-logo-lockup inline-flex items-end" : "inline-flex items-center",
        showWordmark ? null : dimensions.gap,
        className,
      )}
      {...(showWordmark ? { "data-size": size } : {})}
    >
      {mark}
      {showWordmark ? (
        <span className={brandWordmarkClass}>
          <span className="brand-wordmark-visual">Visual </span>
          <span className="brand-wordmark-era">Era</span>
        </span>
      ) : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex rounded-lg transition-opacity hover:opacity-90">
      {content}
    </Link>
  );
}

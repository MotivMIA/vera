import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { width: 32, height: 32, className: "size-8" },
  md: { width: 40, height: 40, className: "size-10" },
  lg: { width: 56, height: 56, className: "size-14" },
} as const;

export type BrandLogoProps = {
  href?: string;
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
  href = "/",
  size = "md",
  showWordmark = false,
  className,
  priority = false,
  variant = "mask",
}: BrandLogoProps) {
  const dimensions = sizeMap[size];

  const mark =
    variant === "png" ? (
      <Image
        src="/brand/logo.png"
        alt=""
        width={dimensions.width}
        height={dimensions.height}
        className={cn(dimensions.className, "shrink-0 object-contain")}
        priority={priority}
        aria-hidden
      />
    ) : (
      <span
        role="img"
        aria-label="Visual Era"
        className={cn(dimensions.className, "brand-logo-mark inline-block shrink-0")}
      />
    );

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {mark}
      {showWordmark ? (
        <span className="text-sm font-semibold tracking-wide text-foreground">Visual Era</span>
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

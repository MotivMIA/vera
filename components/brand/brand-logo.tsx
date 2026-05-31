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
};

export function BrandLogo({
  href = "/",
  size = "md",
  showWordmark = false,
  className,
  priority = false,
}: BrandLogoProps) {
  const dimensions = sizeMap[size];

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/brand/logo.png"
        alt="Visual Era"
        width={dimensions.width}
        height={dimensions.height}
        className={cn(dimensions.className, "shrink-0 object-contain")}
        priority={priority}
      />
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

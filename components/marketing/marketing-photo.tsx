import { cn } from "@/lib/utils";

/** JPEG/PNG fallback for AVIF/WebP sources under `public/`. */
function rasterFallback(src: string): string {
  if (/\.avif$/i.test(src)) return src.replace(/\.avif$/i, ".jpg");
  if (/\.webp$/i.test(src)) return src.replace(/\.webp$/i, ".jpg");
  return src;
}

export type MarketingPhotoProps = {
  /** Path under public/, e.g. `/marketing/hero-primary.avif` */
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

/**
 * Modern formats + raster fallback via `<picture>` — reliable in Firefox when AVIF decode fails.
 */
export function MarketingPhoto({
  src,
  alt,
  className,
  imgClassName,
  priority = false,
}: MarketingPhotoProps) {
  const fallback = rasterFallback(src);
  const useAvif = /\.avif$/i.test(src);
  const useWebp = /\.webp$/i.test(src);

  return (
    <picture className={cn("block size-full", className)}>
      {useAvif ? <source srcSet={src} type="image/avif" /> : null}
      {useWebp ? <source srcSet={src} type="image/webp" /> : null}
      <img
        src={fallback}
        alt={alt}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
        className={cn("size-full object-cover", imgClassName)}
      />
    </picture>
  );
}

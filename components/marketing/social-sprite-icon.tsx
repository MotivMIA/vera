import Image from "next/image";
import {
  BRAND_SOCIAL_ICON_LABELS,
  BRAND_SOCIAL_ICON_PATHS,
} from "@/lib/brand/brand-social-icons";
import { SOCIAL_SPRITE_PATH, type SocialSpriteIconVariant } from "@/lib/brand/social-sprite";
import { cn } from "@/lib/utils";

export type SocialSpriteIconTone = "color" | "mono";

export type SocialSpriteIconProps = {
  variant: SocialSpriteIconVariant;
  /** `color` — flat full-color brand SVGs (default). `mono` — `currentColor` sprite. */
  tone?: SocialSpriteIconTone;
  className?: string;
};

/** @alias SocialSpriteIcon */
export type BrandSocialIconProps = SocialSpriteIconProps;

export function SocialSpriteIcon({
  variant,
  tone = "color",
  className,
}: SocialSpriteIconProps) {
  if (tone === "mono") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={cn("brand-social-icon brand-social-icon--mono shrink-0", className)}
        data-social-variant={variant}
      >
        <use href={`${SOCIAL_SPRITE_PATH}#${variant}`} />
      </svg>
    );
  }

  return (
    <span
      className={cn("brand-social-icon inline-flex shrink-0", className)}
      data-social-variant={variant}
    >
      <Image
        src={BRAND_SOCIAL_ICON_PATHS[variant]}
        alt=""
        width={24}
        height={24}
        aria-hidden
        className="size-full object-contain"
      />
    </span>
  );
}

/** Colored brand social icon (default). Same as `SocialSpriteIcon` with `tone="color"`. */
export function BrandSocialIcon(props: BrandSocialIconProps) {
  return <SocialSpriteIcon {...props} />;
}

export { BRAND_SOCIAL_ICON_LABELS };

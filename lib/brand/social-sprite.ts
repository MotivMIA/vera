/** SVG symbol sprite — regenerate with `npm run sprites:social`. */
import {
  SITE_SOCIAL_ICON_IDS,
  SITE_SOCIAL_ICON_MAP,
  type SiteSocialIconId,
} from "@/lib/brand/site-social-icons";

export const SOCIAL_SPRITE_PATH = "/social-sprite.svg";

/** Kebab-case symbol ids available in the sprite (site minimal set). */
export type SocialSpriteIconVariant = SiteSocialIconId;

export const SOCIAL_SPRITE_ICON_LABELS: Record<SocialSpriteIconVariant, string> =
  Object.fromEntries(
    SITE_SOCIAL_ICON_IDS.map((id) => [id, SITE_SOCIAL_ICON_MAP[id].label]),
  ) as Record<SocialSpriteIconVariant, string>;

import Image from "next/image";
import {
  APP_STORE_BADGE_ASSETS,
  APP_STORE_ICON_ASSETS,
  APP_STORE_LINKS,
  type AppStoreLink,
  type AppStorePlatform,
} from "@/lib/brand/app";
import {
  borderAccentHoverClass,
  borderAccentStrongClass,
  focusRingClass,
  panelSurfaceClass,
  panelSurfaceHoverClass,
} from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

export type AppStoreBadgeSize = "sm" | "md" | "lg";
export type AppStoreBadgeLayout = "row" | "stack";
/** `official` — full badge artwork; `styled` — themed shell with icon + store copy */
export type AppStoreBadgeVariant = "official" | "styled";

const BADGE_ASPECT = APP_STORE_BADGE_ASSETS.apple.width / APP_STORE_BADGE_ASSETS.apple.height;

const sizeConfig = {
  sm: {
    heightClass: "h-8",
    styledMinWidth: "min-w-[7.75rem]",
    iconBox: "h-6 w-6",
    topLine: "text-[9px]",
    storeName: "text-xs",
    padding: "px-2.5 py-1.5",
  },
  md: {
    heightClass: "h-10",
    styledMinWidth: "min-w-[8.75rem]",
    iconBox: "h-7 w-7",
    topLine: "text-[10px]",
    storeName: "text-sm",
    padding: "px-3 py-2",
  },
  lg: {
    heightClass: "h-12",
    styledMinWidth: "min-w-[10rem]",
    iconBox: "h-8 w-8",
    topLine: "text-[11px]",
    storeName: "text-base",
    padding: "px-3.5 py-2.5",
  },
} as const;

const layoutConfig = {
  row: "flex-row flex-wrap items-center",
  stack: "flex-col items-stretch",
} as const;

function badgeShellClassName({
  interactive,
  disabled,
  size,
  variant,
}: {
  interactive: boolean;
  disabled: boolean;
  size: AppStoreBadgeSize;
  variant: AppStoreBadgeVariant;
}) {
  const sized = sizeConfig[size];

  return cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border text-left text-white",
    borderAccentStrongClass,
    variant === "official"
      ? "bg-transparent p-0"
      : cn("gap-2", panelSurfaceClass, sized.padding, sized.styledMinWidth),
    interactive &&
      cn(
        "transition",
        variant === "official"
          ? cn(borderAccentHoverClass, "hover:shadow-[0_0_20px_var(--brand-glow)]")
          : cn(
              borderAccentHoverClass,
              panelSurfaceHoverClass,
              "hover:shadow-[0_0_16px_var(--brand-glow)]",
            ),
        focusRingClass,
      ),
    disabled && "pointer-events-none cursor-default opacity-60",
  );
}

function OfficialBadgeImage({
  platform,
  size,
}: {
  platform: AppStorePlatform;
  size: AppStoreBadgeSize;
}) {
  const asset = APP_STORE_BADGE_ASSETS[platform];
  const { heightClass } = sizeConfig[size];
  const heightPx = size === "sm" ? 32 : size === "md" ? 40 : 48;
  const widthPx = Math.round(heightPx * BADGE_ASPECT);

  return (
    <Image
      src={asset.src}
      alt=""
      width={widthPx}
      height={heightPx}
      className={cn(heightClass, "w-auto max-w-none object-contain")}
      unoptimized
      aria-hidden
    />
  );
}

function StyledBadgeIcon({ platform }: { platform: AppStorePlatform }) {
  const icon = APP_STORE_ICON_ASSETS[platform];

  return (
    <span className="flex shrink-0 items-center justify-center">
      <Image
        src={icon.src}
        alt=""
        width={icon.width}
        height={icon.height}
        className="max-h-full max-w-full object-contain"
        unoptimized
        aria-hidden
      />
    </span>
  );
}

function StyledBadgeContent({
  link,
  size,
}: {
  link: AppStoreLink;
  size: AppStoreBadgeSize;
}) {
  const sized = sizeConfig[size];

  return (
    <>
      <span className={cn("flex shrink-0 items-center justify-center", sized.iconBox)}>
        <StyledBadgeIcon platform={link.platform} />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={cn("font-normal tracking-wide text-white/80", sized.topLine)}>
          {link.topLine}
        </span>
        <span className={cn("mt-0.5 font-semibold tracking-tight text-white", sized.storeName)}>
          {link.storeName}
        </span>
      </span>
    </>
  );
}

function StoreBadge({
  link,
  size,
  variant,
}: {
  link: AppStoreLink;
  size: AppStoreBadgeSize;
  variant: AppStoreBadgeVariant;
}) {
  const asset = APP_STORE_BADGE_ASSETS[link.platform];
  const ariaLabel = asset.ariaLabel;

  const content =
    variant === "official" ? (
      <OfficialBadgeImage platform={link.platform} size={size} />
    ) : (
      <StyledBadgeContent link={link} size={size} />
    );

  if (link.href === null) {
    return (
      <span
        aria-label={`${ariaLabel} (coming soon)`}
        title="Coming soon"
        className={badgeShellClassName({
          interactive: false,
          disabled: true,
          size,
          variant,
        })}
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={badgeShellClassName({
        interactive: true,
        disabled: false,
        size,
        variant,
      })}
    >
      {content}
    </a>
  );
}

export type AppStoreBadgesProps = {
  links?: readonly AppStoreLink[];
  size?: AppStoreBadgeSize;
  layout?: AppStoreBadgeLayout;
  variant?: AppStoreBadgeVariant;
  className?: string;
};

export function AppStoreBadges({
  links = APP_STORE_LINKS,
  size = "md",
  layout = "row",
  variant = "official",
  className,
}: AppStoreBadgesProps) {
  const gap = layout === "row" ? "gap-3 sm:gap-2.5" : "gap-2.5";

  return (
    <div className={cn("flex", layoutConfig[layout], gap, className)}>
      {links.map((link) => (
        <StoreBadge key={link.platform} link={link} size={size} variant={variant} />
      ))}
    </div>
  );
}

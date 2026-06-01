import Image from "next/image";
import type { AppStoreLink } from "@/lib/brand/app";

const badgeClassName =
  "inline-flex w-fit shrink-0 min-h-[2.75rem] min-w-[8.25rem] items-center gap-2 rounded-lg bg-black px-3 py-2 text-left text-white ring-1 ring-white/10";

const badgeInteractiveClassName =
  "transition hover:bg-neutral-900 hover:ring-white/20";

const storeBadgeIcons = {
  apple: {
    src: "/badges/apple.svg",
    width: 28,
    height: 35,
    className: "h-7 w-auto shrink-0",
  },
  google: {
    src: "/badges/play.svg",
    width: 24,
    height: 26,
    className: "h-6 w-auto shrink-0",
  },
} as const;

function StoreIcon({ platform }: { platform: AppStoreLink["platform"] }) {
  const icon = storeBadgeIcons[platform];

  return (
    <Image
      src={icon.src}
      alt=""
      width={icon.width}
      height={icon.height}
      className={icon.className}
      aria-hidden
      unoptimized
    />
  );
}

function BadgeContent({ link }: { link: AppStoreLink }) {
  return (
    <>
      <StoreIcon platform={link.platform} />
      <span className="flex flex-col leading-none">
        <span className="text-[10px] font-normal tracking-wide">{link.topLine}</span>
        <span className="mt-0.5 text-sm font-semibold tracking-tight">{link.storeName}</span>
      </span>
    </>
  );
}

type AppStoreBadgesProps = {
  links: readonly AppStoreLink[];
};

export function AppStoreBadges({ links }: AppStoreBadgesProps) {
  return (
    <div className="flex flex-row flex-wrap items-start gap-3 sm:gap-2.5">
      {links.map((link) => {
        if (link.href === null) {
          return (
            <span
              key={link.platform}
              aria-disabled="true"
              title="Coming soon"
              className={`${badgeClassName} cursor-default`}
            >
              <BadgeContent link={link} />
            </span>
          );
        }

        const href = link.href;

        return (
          <a
            key={link.platform}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${badgeClassName} ${badgeInteractiveClassName}`}
          >
            <BadgeContent link={link} />
          </a>
        );
      })}
    </div>
  );
}

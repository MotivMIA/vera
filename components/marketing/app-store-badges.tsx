import type { AppStoreLink } from "@/lib/brand/app";

const badgeClassName =
  "inline-flex min-w-[8.5rem] items-center gap-2.5 rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-left transition";

const badgeInteractiveClassName =
  "hover:border-[var(--brand-magenta)]/40 hover:bg-white/[0.07] hover:text-[var(--brand-magenta-bright)]";

const badgeDisabledClassName = "cursor-default opacity-70";

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.47-.12-1.09.476-2.29 1.15-3.04.714-.84 1.963-1.48 3.014-1.51zM20.64 17.07c-.577 1.33-.85 1.93-1.588 3.11-1.03 1.66-2.476 3.73-4.268 3.74-1.595.01-2.005-1.04-4.163-1.04-2.158 0-2.606 1.03-4.202 1.05-1.792.01-3.257-1.75-4.287-3.41-2.932-4.71-3.245-10.22-1.434-13.15 1.285-2.01 3.304-3.2 5.238-3.2 1.945 0 3.165 1.04 4.776 1.04 1.568 0 2.525-1.04 4.767-1.04 1.707 0 3.515.93 4.803 2.54-4.23 2.29-3.535 8.25.756 10.36z" />
    </svg>
  );
}

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M3.609 1.814 13.792 12 3.61 22.186a1.004 1.004 0 0 1-.601.186 1 1 0 0 1-1-1V2.628a1 1 0 0 1 1.601-.814zM14.5 12.707 20.95 19.15a1 1 0 0 0 1.601-.814V5.664a1 1 0 0 0-1.601-.814L14.5 11.293v1.414zM13.792 12 5.5 3.708V20.292L13.792 12z" />
    </svg>
  );
}

function StoreIcon({ platform }: { platform: AppStoreLink["platform"] }) {
  if (platform === "apple") {
    return <AppleIcon className="size-6 shrink-0" />;
  }
  return <GooglePlayIcon className="size-6 shrink-0" />;
}

function BadgeContent({ link }: { link: AppStoreLink }) {
  return (
    <>
      <StoreIcon platform={link.platform} />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{link.topLine}</span>
        <span className="text-sm font-semibold text-foreground">{link.storeName}</span>
      </span>
    </>
  );
}

type AppStoreBadgesProps = {
  links: readonly AppStoreLink[];
};

export function AppStoreBadges({ links }: AppStoreBadgesProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {links.map((link) => {
        if (link.href === null) {
          return (
            <span
              key={link.platform}
              aria-disabled="true"
              title="Coming soon"
              className={`${badgeClassName} ${badgeDisabledClassName}`}
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

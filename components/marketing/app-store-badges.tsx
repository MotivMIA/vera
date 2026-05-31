import type { AppStoreLink } from "@/lib/brand/app";

const badgeClassName =
  "inline-flex min-h-[2.75rem] min-w-[8.25rem] flex-1 items-center gap-2 rounded-lg bg-black px-3 py-2 text-left text-white ring-1 ring-white/10";

const badgeInteractiveClassName =
  "transition hover:bg-neutral-900 hover:ring-white/20";

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
      viewBox="0 0 512 512"
      className={className}
      aria-hidden
    >
      <path fill="#EA4335" d="M325.3 234.3 104.6 13.6C99.8 8.8 92.8 6 85.5 6 74.6 6 65.3 15.3 65.3 26.2v459.6c0 10.9 9.3 20.2 20.2 20.2 7.3 0 14.3-2.8 19.1-7.6L325.3 277.7c8.1-8.1 8.1-21.2 0-29.3z" />
      <path fill="#FBBC04" d="M325.3 256 104.6 476.7c-4.8 4.8-11.8 7.6-19.1 7.6-10.9 0-20.2-9.3-20.2-20.2V26.2C65.3 15.3 74.6 6 85.5 6c7.3 0 14.3 2.8 19.1 7.6L325.3 234.3c8.1 8.1 8.1 21.2 0 29.3z" />
      <path fill="#4285F4" d="M471.6 244.7 325.3 98.4c-8.1-8.1-21.2-8.1-29.3 0L104.6 289.8l220.7 220.7c8.1 8.1 21.2 8.1 29.3 0l146.3-146.3c8.1-8.1 8.1-21.2 0-29.3z" />
      <path fill="#34A853" d="M471.6 267.3 325.3 413.6c-8.1 8.1-21.2 8.1-29.3 0L104.6 256l191.4-191.4c8.1-8.1 21.2-8.1 29.3 0l146.3 146.3c8.1 8.1 8.1 21.2 0 29.3z" />
    </svg>
  );
}

function StoreIcon({ platform }: { platform: AppStoreLink["platform"] }) {
  if (platform === "apple") {
    return <AppleIcon className="size-7 shrink-0" />;
  }
  return <GooglePlayIcon className="size-6 shrink-0" />;
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
    <div className="flex flex-row flex-wrap gap-2.5">
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

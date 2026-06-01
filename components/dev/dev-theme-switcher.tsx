"use client";

import {
  ThemeSwitcher,
  type ThemeSwitcherProps,
} from "@/components/dev/theme-switcher";

const showDevThemeSwitcher =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_DEV_THEME_SWITCHER === "true";

export type DevThemeSwitcherProps = ThemeSwitcherProps;

/** Dev-only theme cycler. Default variant is compact for header placement. */
export function DevThemeSwitcher({
  variant = "compact",
  className,
}: DevThemeSwitcherProps = {}) {
  if (!showDevThemeSwitcher) {
    return null;
  }
  return <ThemeSwitcher variant={variant} className={className} />;
}

/** Label + compact switcher for mobile nav drawer (hidden in production). */
export function DevThemeSwitcherDrawerRow() {
  if (!showDevThemeSwitcher) {
    return null;
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-surface-hover)] px-3 py-2.5">
      <span className="text-sm font-semibold text-[var(--landing-text)]">Theme (dev)</span>
      <ThemeSwitcher variant="compact" className="max-w-none shrink-0" />
    </div>
  );
}

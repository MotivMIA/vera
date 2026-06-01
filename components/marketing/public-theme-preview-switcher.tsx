"use client";

import {
  THEME_LABELS,
  useThemeSwitcherState,
} from "@/components/dev/theme-switcher";
import { cn } from "@/lib/utils";

/** Temporary: enable public palette QA on production via Vercel env. */
const showPublicThemePreview =
  process.env.NEXT_PUBLIC_THEME_PREVIEW_PUBLIC === "true";

export type PublicThemePreviewSwitcherProps = {
  className?: string;
};

/** Env-gated theme cycler for external color QA (not dev tooling). */
export function PublicThemePreviewSwitcher({
  className,
}: PublicThemePreviewSwitcherProps = {}) {
  const { theme, cycle } = useThemeSwitcherState();
  const label = THEME_LABELS[theme];

  if (!showPublicThemePreview) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        "inline-flex min-h-9 max-w-[11rem] items-center gap-1.5 truncate rounded-md border border-[var(--landing-border)] bg-[var(--landing-surface)]/80 px-2.5 py-1.5 text-xs font-medium leading-snug text-[var(--landing-text)] transition hover:border-[var(--landing-accent,var(--color-accent))] hover:bg-[var(--landing-surface-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent,var(--color-accent))]",
        className,
      )}
      title={`Color palette preview: ${label}`}
      aria-label={`Theme preview: ${label}. Click to try the next palette.`}
    >
      <span className="shrink-0 text-[var(--landing-muted)]">Theme</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

/** Theme preview row for mobile nav drawer when public preview is enabled. */
export function PublicThemePreviewSwitcherDrawerRow() {
  if (!showPublicThemePreview) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-surface-hover)] px-3 py-2.5">
      <span className="text-sm font-medium text-[var(--landing-muted)]">Theme</span>
      <PublicThemePreviewSwitcher className="max-w-none shrink-0" />
    </div>
  );
}

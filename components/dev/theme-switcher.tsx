"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const THEME_IDS = [
  "noir-magenta",
  "noir-magenta-light",
  "vera-classic",
  "vera-classic-light",
  "crm-dark",
  "crm-light",
  "damascus-steel-dark",
  "damascus-steel-light",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

const STORAGE_KEY = "ve-dev-theme";
const DEFAULT_THEME: ThemeId = "noir-magenta";

/** One-time localStorage migration from retired theme ids. */
const LEGACY_THEME_IDS: Record<string, ThemeId> = {
  "inflow-light": "crm-light",
  "ivory-champagne": "noir-magenta",
  "emerald-marble": "noir-magenta",
  "emerald-marble-light": "noir-magenta",
  leopard: "noir-magenta",
  "leopard-light": "noir-magenta",
  "obsidian-gold": "noir-magenta",
  "obsidian-gold-light": "noir-magenta",
  "midnight-amethyst": "noir-magenta",
  "midnight-amethyst-light": "noir-magenta",
  "damascus-steel": "damascus-steel-dark",
};

const LIGHT_THEMES = new Set<ThemeId>([
  "crm-light",
  "noir-magenta-light",
  "vera-classic-light",
  "damascus-steel-light",
]);

export const THEME_LABELS: Record<ThemeId, string> = {
  "noir-magenta": "Noir Magenta",
  "noir-magenta-light": "Noir Magenta Light",
  "vera-classic": "VERA Classic",
  "vera-classic-light": "VERA Classic Light",
  "crm-dark": "CRM Dark",
  "crm-light": "CRM Light",
  "damascus-steel-dark": "Damascus Steel Dark",
  "damascus-steel-light": "Damascus Steel Light",
};

function isThemeId(value: string): value is ThemeId {
  return (THEME_IDS as readonly string[]).includes(value);
}

function resolveStoredTheme(stored: string): ThemeId {
  const resolved = LEGACY_THEME_IDS[stored] ?? stored;
  return isThemeId(resolved) ? resolved : DEFAULT_THEME;
}

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", !LIGHT_THEMES.has(theme));
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode */
  }
}

export type ThemeSwitcherVariant = "floating" | "compact";

export type ThemeSwitcherProps = {
  variant?: ThemeSwitcherVariant;
  className?: string;
};

export function useThemeSwitcherState() {
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const resolved = resolveStoredTheme(stored);
        applyTheme(resolved);
        setTheme(resolved);
        return;
      }
    } catch {
      /* ignore */
    }
    applyTheme(DEFAULT_THEME);
  }, []);

  const cycle = useCallback(() => {
    const index = THEME_IDS.indexOf(theme);
    const next = THEME_IDS[(index + 1) % THEME_IDS.length] ?? DEFAULT_THEME;
    applyTheme(next);
    setTheme(next);
  }, [theme]);

  return { theme, cycle };
}

export function ThemeSwitcher({ variant = "floating", className }: ThemeSwitcherProps) {
  const { theme, cycle } = useThemeSwitcherState();
  const label = THEME_LABELS[theme];

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={cycle}
        className={cn(
          "inline-flex min-h-10 max-w-[13rem] items-center truncate rounded-lg border-2 border-[var(--landing-border-strong,var(--color-border-strong))] bg-[var(--landing-surface-elevated,var(--color-surface-elevated))] px-3.5 py-2 text-sm font-semibold leading-snug text-[var(--landing-text,var(--color-text))] shadow-sm transition hover:border-[var(--landing-accent,var(--color-accent))] hover:bg-[var(--landing-surface-hover,var(--color-surface))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent,var(--color-accent))]",
          className,
        )}
        title={`Cycle theme (dev): ${label}`}
        aria-label={`Development theme: ${label}. Click to cycle.`}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[9999] flex items-center gap-2.5 rounded-xl border-2 border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)]/95 px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-lg backdrop-blur-md",
        className,
      )}
      role="group"
      aria-label="Development theme switcher"
    >
      <span className="hidden text-[var(--color-text-muted)] sm:inline">Theme</span>
      <button
        type="button"
        onClick={cycle}
        className="min-h-9 rounded-lg bg-[var(--color-accent)] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        title="Cycle data-theme palette (dev only)"
      >
        {label}
      </button>
    </div>
  );
}

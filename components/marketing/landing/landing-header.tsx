"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  DevThemeSwitcher,
  DevThemeSwitcherDrawerRow,
} from "@/components/dev/dev-theme-switcher";
import {
  PublicThemePreviewSwitcher,
  PublicThemePreviewSwitcherDrawerRow,
} from "@/components/marketing/public-theme-preview-switcher";
import { LandingButton } from "@/components/marketing/landing/landing-button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type NavLink = { label: string; href: string };
export type NavDropdownItem = { label: string; href: string };

type LandingHeaderProps = {
  nav: NavLink[];
  resourcesLabel: string;
  resourcesItems: NavDropdownItem[];
  helpLabel: string;
  helpHref: string;
  startTrial: string;
  signUpHref: string;
};

export function LandingHeader({
  nav,
  resourcesLabel,
  resourcesItems,
  helpLabel,
  helpHref,
  startTrial,
  signUpHref,
}: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--landing-border)] bg-[var(--landing-bg)]/90 backdrop-blur-md">
      <div className="landing-container flex min-w-0 items-center justify-between gap-4 py-4">
        <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
          <BrandLogo size="md" showWordmark href={null} priority />
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--landing-muted)] transition hover:bg-[var(--landing-surface-hover)] hover:text-[var(--landing-text)]"
            >
              {item.label}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--landing-muted)] transition hover:bg-[var(--landing-surface-hover)] hover:text-[var(--landing-text)]"
              aria-expanded={resourcesOpen}
              onClick={() => setResourcesOpen((o) => !o)}
              onBlur={() => setTimeout(() => setResourcesOpen(false), 150)}
            >
              {resourcesLabel}
              <ChevronDown
                className={cn("size-4 transition", resourcesOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {resourcesOpen ? (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[12rem] rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] py-1 shadow-[var(--landing-shadow)]">
                {resourcesItems.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-[var(--landing-text)] hover:bg-[var(--landing-surface-hover)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link
            href={helpHref}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--landing-muted)] transition hover:bg-[var(--landing-surface-hover)] hover:text-[var(--landing-text)]"
          >
            {helpLabel}
          </Link>
        </nav>

        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          <DevThemeSwitcher variant="compact" />
          <PublicThemePreviewSwitcher />
          <LandingButton size="sm" asChild>
            <Link href={signUpHref}>{startTrial}</Link>
          </LandingButton>
        </div>

        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <DevThemeSwitcher variant="compact" className="max-w-[9.5rem] text-xs" />
          <PublicThemePreviewSwitcher className="max-w-[9rem]" />
          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--landing-border)]"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[var(--landing-border)] bg-[var(--landing-surface)] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--landing-text)] hover:bg-[var(--landing-surface-hover)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-[var(--landing-muted)]">
              {resourcesLabel}
            </p>
            {resourcesItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-[var(--landing-muted)] hover:bg-[var(--landing-surface-hover)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={helpHref}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--landing-text)] hover:bg-[var(--landing-surface-hover)]"
              onClick={() => setMobileOpen(false)}
            >
              {helpLabel}
            </Link>
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-[var(--landing-border)] pt-4">
            <DevThemeSwitcherDrawerRow />
            <PublicThemePreviewSwitcherDrawerRow />
            <LandingButton asChild>
              <Link href={signUpHref}>{startTrial}</Link>
            </LandingButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}

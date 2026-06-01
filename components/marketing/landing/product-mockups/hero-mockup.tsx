/** Decorative dashboard mockup — HTML/CSS/SVG only */
export function HeroMockup() {
  return (
    <div
      className="relative mx-auto w-full min-w-0 max-w-lg"
      aria-hidden
    >
      <div className="landing-card overflow-hidden rounded-[var(--landing-radius-lg)] p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[var(--landing-dot-red)]" />
            <span className="size-2.5 rounded-full bg-[var(--landing-dot-yellow)]" />
            <span className="size-2.5 rounded-full bg-[var(--landing-dot-green)]" />
          </div>
          <span className="text-[10px] font-medium text-[var(--landing-muted)]">Dashboard</span>
        </div>
        <div className="grid min-w-0 grid-cols-3 gap-2">
          {[
            { label: "Revenue", value: "$42.8k", accent: "var(--landing-accent-peach)" },
            { label: "Fans", value: "12.4k", accent: "var(--landing-accent-blue)" },
            { label: "Reply rate", value: "94%", accent: "var(--landing-accent-green)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-xl p-2.5"
              style={{ background: stat.accent }}
            >
              <p className="truncate text-[9px] font-medium text-[var(--landing-muted)]">
                {stat.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-[var(--landing-text)]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-[var(--landing-surface-muted)] p-3">
          <svg viewBox="0 0 280 80" className="h-16 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--landing-chart-from)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--landing-chart-from)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 60 L40 52 L80 58 L120 35 L160 42 L200 22 L240 30 L280 12 L280 80 L0 80 Z"
              fill="url(#heroChartFill)"
            />
            <path
              d="M0 60 L40 52 L80 58 L120 35 L160 42 L200 22 L240 30 L280 12"
              fill="none"
              stroke="var(--landing-chart-from)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex min-w-0 items-center gap-2 rounded-lg bg-[var(--landing-surface-inset)] p-2"
            >
              <span className="size-7 shrink-0 rounded-full bg-[var(--landing-accent-lavender)]" />
              <div className="min-w-0 flex-1">
                <div className="h-2 w-3/4 max-w-[8rem] rounded bg-[var(--landing-skeleton)]" />
                <div className="mt-1 h-1.5 w-1/2 max-w-[5rem] rounded bg-[var(--landing-skeleton-muted)]" />
              </div>
              <span className="shrink-0 rounded-md bg-[var(--landing-surface-subtle)] px-2 py-0.5 text-[9px] font-medium text-[var(--landing-muted)]">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating avatar cards */}
      <div className="absolute -left-2 top-8 z-10 landing-card flex min-w-0 max-w-[9rem] items-center gap-2 p-2 shadow-lg md:-left-6 md:max-w-[10rem]">
        <span className="size-9 shrink-0 rounded-full bg-[var(--landing-accent-peach)]" />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold">New fan</p>
          <p className="text-[9px] text-[var(--landing-muted)]">+$124 today</p>
        </div>
      </div>
      <div className="absolute -right-1 bottom-16 z-10 landing-card flex min-w-0 max-w-[9rem] items-center gap-2 p-2 shadow-lg md:-right-4 md:max-w-[10rem]">
        <span className="size-9 shrink-0 rounded-full bg-[var(--landing-accent-blue)]" />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold">Smart list</p>
          <p className="text-[9px] text-[var(--landing-muted)]">842 VIPs</p>
        </div>
      </div>
    </div>
  );
}

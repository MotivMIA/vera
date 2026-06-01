/** Analytics panel mockup — SVG bar chart + KPI strip */
export function AnalyticsMockup() {
  const bars = [42, 68, 55, 82, 71, 94, 78, 88];

  return (
    <div className="landing-card min-w-0 overflow-hidden rounded-[var(--landing-radius-lg)] p-4 md:p-6" aria-hidden>
      <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-[var(--landing-text)]">Growth overview</p>
          <p className="text-[10px] text-[var(--landing-muted)]">Last 30 days</p>
        </div>
        <span className="rounded-full bg-[var(--landing-badge-positive)] px-2.5 py-1 text-[10px] font-semibold text-[var(--landing-badge-positive-text)]">
          +18.4%
        </span>
      </div>
      <div className="flex min-w-0 items-end justify-between gap-1.5" style={{ height: "7rem" }}>
        {bars.map((h, i) => (
          <div
            key={i}
            className="min-w-0 flex-1 rounded-t-md bg-gradient-to-t from-[var(--landing-chart-from)] to-[var(--landing-chart-to)]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { k: "Messages", v: "18.2k" },
          { k: "PPV sent", v: "2.4k" },
          { k: "Tips", v: "$9.1k" },
          { k: "Churn", v: "2.1%" },
        ].map((item) => (
          <div
            key={item.k}
            className="min-w-0 rounded-lg bg-[var(--landing-surface-muted)] px-2 py-2 text-center"
          >
            <p className="truncate text-[9px] text-[var(--landing-muted)]">{item.k}</p>
            <p className="text-xs font-bold text-[var(--landing-text)]">{item.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

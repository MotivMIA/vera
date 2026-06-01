import { cn } from "@/lib/utils";

type PollCardProps = {
  question: string;
  options: { label: string; percent: number }[];
  accent?: "peach" | "blue" | "green" | "lavender";
  className?: string;
};

const accentBar = {
  peach: "bg-[var(--landing-poll-peach)]",
  blue: "bg-[var(--landing-poll-blue)]",
  green: "bg-[var(--landing-poll-green)]",
  lavender: "bg-[var(--landing-poll-lavender)]",
} as const;

export function PollCard({ question, options, accent = "blue", className }: PollCardProps) {
  return (
    <article className={cn("landing-card min-w-0 p-5 md:p-6", className)}>
      <p className="text-sm font-semibold text-[var(--landing-text)]">{question}</p>
      <ul className="mt-4 space-y-3" role="list">
        {options.map((opt) => (
          <li key={opt.label} className="min-w-0">
            <div className="mb-1 flex min-w-0 items-center justify-between gap-2 text-xs">
              <span className="truncate text-[var(--landing-muted)]">{opt.label}</span>
              <span className="shrink-0 font-medium text-[var(--landing-text)]">{opt.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--landing-poll-track)]">
              <div
                className={cn("h-full rounded-full transition-all", accentBar[accent])}
                style={{ width: `${opt.percent}%` }}
                role="presentation"
              />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

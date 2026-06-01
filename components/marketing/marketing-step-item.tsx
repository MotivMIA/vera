import { panelShellClass } from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

export type MarketingStepItemProps = {
  step: string;
  title: string;
  body: string;
  className?: string;
};

export function MarketingStepItem({ step, title, body, className }: MarketingStepItemProps) {
  return (
    <li
      className={cn(
        panelShellClass,
        "min-w-0 list-none transition duration-300 hover:border-border-accent-hover",
        className,
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-accent">{step}</span>
      <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </li>
  );
}

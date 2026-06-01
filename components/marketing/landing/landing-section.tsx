import { cn } from "@/lib/utils";

type LandingSectionProps = {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  /** Tighter vertical rhythm between stacked sections */
  compact?: boolean;
};

export function LandingSection({
  id,
  className,
  containerClassName,
  children,
  compact,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn("landing-section", compact && "py-12 md:py-16", className)}
    >
      <div className={cn("landing-container min-w-0", containerClassName)}>{children}</div>
    </section>
  );
}

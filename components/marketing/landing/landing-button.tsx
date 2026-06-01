import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const landingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--landing-accent-orange)] text-[var(--landing-cta-fg)] shadow-sm hover:bg-[var(--landing-accent-orange-hover)] hover:shadow-md",
        secondary:
          "border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] hover:border-[var(--landing-border-strong)] hover:bg-[var(--landing-surface-hover)]",
        ghost:
          "text-[var(--landing-muted)] hover:bg-[var(--landing-surface-hover)] hover:text-[var(--landing-text)]",
        link: "h-auto p-0 text-[var(--landing-text)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type LandingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof landingButtonVariants> & {
    asChild?: boolean;
  };

export function LandingButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: LandingButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(landingButtonVariants({ variant, size, className }))} {...props} />;
}

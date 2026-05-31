import { UserButton } from "@clerk/nextjs";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Progress } from "@/components/ui/progress";

type OnboardingShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  progress: number;
  asideExtra?: React.ReactNode;
};

export function OnboardingShell({ children, eyebrow, title, description, progress, asideExtra }: OnboardingShellProps) {
  return (
    <main className="min-h-screen px-5 py-6 md:px-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <BrandLogo size="sm" showWordmark />
        <UserButton />
      </header>
      <section className="mx-auto grid max-w-6xl gap-8 py-10 lg:grid-cols-[0.75fr_1fr] lg:py-16">
        <aside className="space-y-6">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-normal sm:text-5xl">{title}</h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">{description}</p>
          </div>
          <div className="max-w-sm space-y-3">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
          {asideExtra}
        </aside>
        {children}
      </section>
    </main>
  );
}

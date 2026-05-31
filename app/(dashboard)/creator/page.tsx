import { Badge } from "@/components/ui/badge";

export default function CreatorDashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <Badge className="mb-4 border-accent/30 bg-accent/10 text-accent">Coming soon</Badge>
      <h1 className="text-balance text-4xl font-semibold tracking-normal text-foreground">Creator dashboard</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
        Performance, content, and account tools for Visual Era creators will live here. Onboarding stays on the public
        site until this module ships.
      </p>
    </main>
  );
}

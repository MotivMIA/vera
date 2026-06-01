import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPreferredLocale } from "@/lib/i18n/preferred-locale";
import { pathWithLocale } from "@/lib/i18n/paths";
import { enforceOnboardingPath } from "@/lib/onboarding/guards";

export default async function SuccessPage() {
  await enforceOnboardingPath("/success");
  const homeHref = pathWithLocale(await getPreferredLocale(), "/");
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <Card className="glass-panel max-w-xl rounded-2xl text-center">
        <CardContent className="space-y-6 p-8 sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
            <CheckCircle2 className="size-7" />
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold">Onboarding complete</h1>
            <p className="text-muted-foreground">
              Your verification and signing packet are recorded. Visual Era will review the final onboarding audit trail and follow up with next steps.
            </p>
          </div>
          <Button asChild>
            <Link href={homeHref}>Return home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

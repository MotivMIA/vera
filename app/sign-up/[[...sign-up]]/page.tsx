import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="block text-center text-sm font-medium text-muted-foreground hover:text-foreground">
          Visual Era
        </Link>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" />
      </div>
    </main>
  );
}

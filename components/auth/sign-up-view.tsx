"use client";

import { AppAuthShell } from "@/components/marketing/app-auth-shell";

/** Same unified auth flow as sign-in; route kept for marketing links. */
export function SignUpView() {
  return <AppAuthShell showMobileBackLink />;
}

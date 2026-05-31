/** Shared Clerk UI theme — blends SignIn/SignUp into the Visual Era auth card. */
export const clerkAppearance = {
  variables: {
    colorBackground: "transparent",
    colorInputBackground: "rgba(0, 0, 0, 0.35)",
    colorInputText: "#f6f4ef",
    colorText: "#f6f4ef",
    colorTextSecondary: "#9da3af",
    colorPrimary: "#d8b56d",
    colorDanger: "#f87171",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full max-w-none",
    cardBox: "w-full max-w-none !shadow-none !border-0 !bg-transparent !p-0",
    card: "w-full max-w-none gap-4 !shadow-none !border-0 !bg-transparent !p-0",
    main: "!bg-transparent",
    scrollBox: "!bg-transparent",
    page: "!bg-transparent",
    header: "gap-2",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    logoBox: "hidden",
    socialButtons: "gap-2",
    socialButtonsBlockButton:
      "h-11 border border-white/10 bg-white/[0.04] text-[#f6f4ef] hover:bg-white/[0.08]",
    socialButtonsBlockButtonText: "text-sm font-medium",
    dividerLine: "bg-white/10",
    dividerText: "text-xs uppercase tracking-wider text-[#6b7280]",
    formFieldLabel: "text-sm text-[#9da3af]",
    formFieldInput:
      "border-white/10 bg-black/30 text-[#f6f4ef] placeholder:text-[#6b7280] focus:border-[#d8b56d]/50",
    formButtonPrimary:
      "h-11 bg-[#f7f3ea] text-[#090a0d] font-medium hover:bg-white shadow-none",
    footer: "hidden",
    footerAction: "hidden",
    identityPreview: "border-white/10 bg-white/[0.04]",
    formFieldAction: "text-[#d8b56d] hover:text-[#f6f4ef]",
    otpCodeFieldInput: "border-white/10 bg-black/30 text-[#f6f4ef]",
  },
  options: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
} as const;

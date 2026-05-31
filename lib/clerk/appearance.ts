/** Shared Clerk UI theme — used on ClerkProvider and embedded SignIn/SignUp. */
export const clerkAppearance = {
  variables: {
    colorBackground: "#0d0f13",
    colorText: "#f6f4ef",
    colorPrimary: "#d8b56d",
    borderRadius: "0.75rem",
  },
  elements: {
    cardBox: "shadow-none border border-white/10",
    formButtonPrimary: "bg-[#f7f3ea] text-[#090a0d] hover:bg-white",
  },
  options: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
} as const;

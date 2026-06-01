export default function OnboardingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen">
      <div className="brand-page-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

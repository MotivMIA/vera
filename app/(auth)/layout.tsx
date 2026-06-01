export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="relative min-h-screen">{children}</div>;
}

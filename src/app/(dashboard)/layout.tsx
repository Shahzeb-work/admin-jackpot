import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line bg-cream-surface px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold text-gold-bright">Jackpot Admin</span>
          <nav className="flex items-center gap-4 text-sm text-ink-soft">
            <a href="/tournaments" className="hover:text-ink">
              Tournaments
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-ink-soft">{admin.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

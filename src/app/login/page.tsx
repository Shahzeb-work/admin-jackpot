import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/tournaments");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-cream-surface p-8 shadow-xl">
        <h1 className="text-center text-2xl font-semibold text-gold-bright">
          Jackpot Admin
        </h1>
        <p className="mt-1 text-center text-sm text-ink-soft">Sign in to manage the platform</p>

        <LoginForm />

        <div className="mt-6 rounded-lg border border-line-soft bg-cream-surface-2 px-3 py-2 text-xs text-ink-soft">
          Test credentials: <span className="text-ink">admin@jackpot.test</span> /{" "}
          <span className="text-ink">Admin123!</span>
        </div>
      </div>
    </main>
  );
}

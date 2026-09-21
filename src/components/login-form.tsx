"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminSignInAction } from "@/lib/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@jackpot.test");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await adminSignInAction({ email, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/tournaments");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs font-medium text-ink-soft">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-line bg-cream-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-gold"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-xs font-medium text-ink-soft">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-lg border border-line bg-cream-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-gold"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-cream transition hover:bg-gold-bright disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminSignOutAction } from "@/lib/actions/auth";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await adminSignOutAction();
          router.push("/login");
          router.refresh();
        })
      }
      disabled={isPending}
      className="rounded-lg border border-line px-3 py-1.5 text-ink-soft transition hover:border-gold hover:text-ink"
    >
      Sign out
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { distributePrizesAction } from "@/lib/actions/tournaments";

export function DistributePrizesButton({
  tournamentId,
  disabled,
}: {
  tournamentId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await distributePrizesAction(tournamentId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  if (disabled) {
    return (
      <span className="rounded-lg border border-line-soft px-3 py-2 text-sm text-ink-soft">
        Prizes distributed
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-cream hover:bg-gold-bright"
      >
        Distribute prizes
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-ink-soft">Ranks by points and pays out winners. Confirm?</span>
      <button
        onClick={run}
        disabled={isPending}
        className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-cream hover:bg-gold-bright disabled:opacity-60"
      >
        {isPending ? "Distributing..." : "Yes, distribute"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-line px-3 py-2 text-sm text-ink-soft hover:border-gold"
      >
        Cancel
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

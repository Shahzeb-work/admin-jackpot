"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { softDeleteTournamentAction, restoreTournamentAction } from "@/lib/actions/tournaments";

export function TournamentRowActions({ id, isDeleted }: { id: string; isDeleted: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      if (isDeleted) {
        await restoreTournamentAction(id);
      } else {
        await softDeleteTournamentAction(id);
      }
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`rounded-md border px-2 py-1 text-xs transition disabled:opacity-60 ${
        isDeleted
          ? "border-success/40 text-success hover:bg-success/10"
          : "border-danger/40 text-danger hover:bg-danger/10"
      }`}
    >
      {isDeleted ? "Restore" : "Delete"}
    </button>
  );
}

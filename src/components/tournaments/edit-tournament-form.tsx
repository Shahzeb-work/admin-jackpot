"use client";

import { TournamentForm, type TournamentFormValues } from "@/components/tournaments/tournament-form";
import { updateTournamentAction } from "@/lib/actions/tournaments";

export function EditTournamentForm({
  id,
  initial,
}: {
  id: string;
  initial: Partial<TournamentFormValues> & { startTime: string; endTime: string };
}) {
  return (
    <TournamentForm
      initial={initial}
      submitLabel="Save changes"
      onSubmit={(values) => updateTournamentAction(id, values)}
    />
  );
}

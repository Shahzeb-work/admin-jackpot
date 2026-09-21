import { TournamentForm } from "@/components/tournaments/tournament-form";
import { createTournamentAction } from "@/lib/actions/tournaments";

export default function NewTournamentPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-ink">New tournament</h1>
      <TournamentForm submitLabel="Create tournament" onSubmit={createTournamentAction} />
    </div>
  );
}

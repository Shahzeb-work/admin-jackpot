import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/tournaments/status-badge";
import { EditTournamentForm } from "@/components/tournaments/edit-tournament-form";
import { GamesManager } from "@/components/tournaments/games-manager";
import { DistributePrizesButton } from "@/components/tournaments/distribute-prizes-button";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const t = await prisma.tournament.findUnique({
    where: { id },
    include: {
      games: true,
      leaderboard: {
        orderBy: [{ place: "asc" }, { points: "desc" }],
        take: 50,
        include: { user: { select: { id: true, username: true, email: true } } },
      },
      _count: { select: { participants: true } },
    },
  });

  if (!t) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-ink">{t.name}</h1>
          <StatusBadge status={t.status} />
        </div>
        <DistributePrizesButton tournamentId={t.id} disabled={t.isPrizeDistributed} />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Details</h2>
        <EditTournamentForm
          id={t.id}
          initial={{
            name: t.name,
            bannerUrl: t.bannerUrl,
            startTime: t.startTime.toISOString(),
            endTime: t.endTime.toISOString(),
            tournamentType: t.tournamentType,
            coinMode: t.coinMode,
            prizePoolGc: t.prizePoolGc,
            prizePoolSc: t.prizePoolSc,
            description: t.description ?? "",
            status: t.status,
            winners: t.winners,
            prizePoolRates: (t.prizePoolRates as never) ?? [],
          }}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Games</h2>
        <GamesManager tournamentId={t.id} games={t.games} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Leaderboard</h2>
          <span className="text-xs text-ink-soft">{t._count.participants} participants</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-surface text-xs uppercase text-ink-soft">
              <tr>
                <th className="px-4 py-3">Place</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">GC Prize</th>
                <th className="px-4 py-3">SC Prize</th>
                <th className="px-4 py-3">Claim status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {t.leaderboard.map((entry) => (
                <tr key={entry.id} className="bg-cream-surface-2/40">
                  <td className="px-4 py-3 text-ink-soft">{entry.place || "-"}</td>
                  <td className="px-4 py-3 text-ink">{entry.user.username ?? entry.user.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{entry.points}</td>
                  <td className="px-4 py-3 text-ink-soft">{entry.gcPrize}</td>
                  <td className="px-4 py-3 text-ink-soft">{entry.scPrize}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {entry.isClaimed ? "Claimed" : entry.availableToClaim ? "Claimable" : "-"}
                  </td>
                </tr>
              ))}
              {t.leaderboard.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                    No participants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

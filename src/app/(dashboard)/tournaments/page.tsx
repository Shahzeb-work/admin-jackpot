import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/tournaments/status-badge";
import { TournamentRowActions } from "@/components/tournaments/tournament-row-actions";

const STATUS_FILTERS = ["all", "commingup", "active", "ended", "canceled", "deleted"];

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "all", q = "" } = await searchParams;

  const where = {
    ...(status === "deleted"
      ? { isDeleted: true }
      : status === "all"
        ? { isDeleted: false }
        : { isDeleted: false, status }),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const tournaments = await prisma.tournament.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true } } },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Tournaments</h1>
        <Link
          href="/tournaments/new"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-cream hover:bg-gold-bright"
        >
          + New tournament
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex items-center gap-2" action="/tournaments">
          <input type="hidden" name="status" value={status} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name..."
            className="rounded-lg border border-line bg-cream-surface-2 px-3 py-1.5 text-sm text-ink outline-none focus:border-gold"
          />
        </form>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s}
              href={`/tournaments?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                status === s
                  ? "border-gold bg-gold/15 text-gold-bright"
                  : "border-line text-ink-soft hover:border-gold-deep"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-surface text-xs uppercase text-ink-soft">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Starts</th>
              <th className="px-4 py-3">Ends</th>
              <th className="px-4 py-3">Participants</th>
              <th className="px-4 py-3">Prizes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {tournaments.map((t) => (
              <tr key={t.id} className="bg-cream-surface-2/40 hover:bg-cream-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/tournaments/${t.id}`} className="font-medium text-ink hover:text-gold-bright">
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3 text-ink-soft">{t.tournamentType}</td>
                <td className="px-4 py-3 text-ink-soft">{new Date(t.startTime).toLocaleString()}</td>
                <td className="px-4 py-3 text-ink-soft">{new Date(t.endTime).toLocaleString()}</td>
                <td className="px-4 py-3 text-ink-soft">{t._count.participants}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {t.isPrizeDistributed ? "Distributed" : "Pending"}
                </td>
                <td className="px-4 py-3">
                  <TournamentRowActions id={t.id} isDeleted={t.isDeleted} />
                </td>
              </tr>
            ))}
            {tournaments.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink-soft">
                  No tournaments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth/current-admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type PrizeRate = { rank: number; gcValue: number; scValue: number };

export type TournamentInput = {
  name: string;
  bannerUrl: string;
  startTime: string; // ISO
  endTime: string; // ISO
  tournamentType: string;
  coinMode: string;
  prizePoolGc: number;
  prizePoolSc: number;
  description: string;
  status: string;
  winners: number;
  prizePoolRates: PrizeRate[];
};

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Not authenticated");
  return admin;
}

function validate(input: TournamentInput): string | null {
  if (!input.name.trim()) return "Name is required.";
  if (!input.bannerUrl.trim()) return "Banner URL is required.";
  if (!input.startTime || !input.endTime) return "Start and end time are required.";
  if (new Date(input.endTime) <= new Date(input.startTime)) {
    return "End time must be after start time.";
  }
  if (!["multiplier", "winning", "wagered", "referral", "freespin"].includes(input.tournamentType)) {
    return "Invalid tournament type.";
  }
  if (!["gc", "sc", "gc_sc"].includes(input.coinMode)) {
    return "Invalid coin mode.";
  }
  if (input.winners < 1) return "Winners must be at least 1.";
  return null;
}

export async function createTournamentAction(input: TournamentInput): Promise<ActionResult> {
  await requireAdmin();
  const error = validate(input);
  if (error) return { ok: false, error };

  await prisma.tournament.create({
    data: {
      name: input.name.trim(),
      bannerUrl: input.bannerUrl.trim(),
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      tournamentType: input.tournamentType,
      coinMode: input.coinMode,
      prizePoolGc: input.prizePoolGc,
      prizePoolSc: input.prizePoolSc,
      description: input.description.trim() || null,
      status: input.status,
      winners: input.winners,
      prizePoolRates: input.prizePoolRates.length ? input.prizePoolRates : undefined,
    },
  });

  revalidatePath("/tournaments");
  return { ok: true };
}

export async function updateTournamentAction(
  id: string,
  input: TournamentInput
): Promise<ActionResult> {
  await requireAdmin();
  const error = validate(input);
  if (error) return { ok: false, error };

  await prisma.tournament.update({
    where: { id },
    data: {
      name: input.name.trim(),
      bannerUrl: input.bannerUrl.trim(),
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      tournamentType: input.tournamentType,
      coinMode: input.coinMode,
      prizePoolGc: input.prizePoolGc,
      prizePoolSc: input.prizePoolSc,
      description: input.description.trim() || null,
      status: input.status,
      winners: input.winners,
      prizePoolRates: input.prizePoolRates.length ? input.prizePoolRates : undefined,
    },
  });

  revalidatePath("/tournaments");
  revalidatePath(`/tournaments/${id}`);
  return { ok: true };
}

export async function softDeleteTournamentAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.tournament.update({ where: { id }, data: { isDeleted: true } });
  revalidatePath("/tournaments");
  return { ok: true };
}

export async function restoreTournamentAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.tournament.update({ where: { id }, data: { isDeleted: false } });
  revalidatePath("/tournaments");
  return { ok: true };
}

export async function addTournamentGameAction(
  tournamentId: string,
  game: { gameId: string; gameName: string; thumbnail?: string }
): Promise<ActionResult> {
  await requireAdmin();
  if (!game.gameId.trim() || !game.gameName.trim()) {
    return { ok: false, error: "Game ID and name are required." };
  }
  await prisma.tournamentGame.create({
    data: {
      tournamentId,
      gameId: game.gameId.trim(),
      gameName: game.gameName.trim(),
      thumbnail: game.thumbnail?.trim() || null,
    },
  });
  revalidatePath(`/tournaments/${tournamentId}`);
  return { ok: true };
}

export async function removeTournamentGameAction(
  tournamentId: string,
  gameRowId: string
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.tournamentGame.delete({ where: { id: gameRowId } });
  revalidatePath(`/tournaments/${tournamentId}`);
  return { ok: true };
}

// Ranks participants by leaderboard points, assigns places 1..winners, computes
// prizes from prizePoolRates (falling back to an even split of the prize pool),
// and opens them up for players to claim via the existing claim flow.
export async function distributePrizesAction(tournamentId: string): Promise<ActionResult> {
  await requireAdmin();

  const t = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!t) return { ok: false, error: "Tournament not found." };
  if (t.isPrizeDistributed) return { ok: false, error: "Prizes already distributed." };

  const entries = await prisma.tournamentLeaderboard.findMany({
    where: { tournamentId },
    orderBy: { points: "desc" },
  });

  if (entries.length === 0) {
    return { ok: false, error: "No participants to distribute prizes to." };
  }

  const rates = (t.prizePoolRates as unknown as PrizeRate[] | null) ?? null;
  const winnerCount = Math.min(t.winners, entries.length);

  const updates = entries.map((entry, index) => {
    const place = index + 1;
    let gcPrize = 0;
    let scPrize = 0;

    if (place <= winnerCount) {
      const rate = rates?.find((r) => r.rank === place);
      if (rate) {
        gcPrize = rate.gcValue;
        scPrize = rate.scValue;
      } else {
        gcPrize = t.prizePoolGc / winnerCount;
        scPrize = t.prizePoolSc / winnerCount;
      }
    }

    return prisma.tournamentLeaderboard.update({
      where: { id: entry.id },
      data: {
        prevPlace: entry.place,
        place,
        gcPrize,
        scPrize,
        availableToClaim: gcPrize > 0 || scPrize > 0,
      },
    });
  });

  await prisma.$transaction([
    ...updates,
    prisma.tournament.update({
      where: { id: tournamentId },
      data: { isPrizeDistributed: true, prizeDistributedAt: new Date(), status: "ended" },
    }),
  ]);

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath("/tournaments");
  return { ok: true };
}

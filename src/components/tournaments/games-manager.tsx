"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTournamentGameAction, removeTournamentGameAction } from "@/lib/actions/tournaments";

type Game = { id: string; gameId: string; gameName: string; thumbnail: string | null };

export function GamesManager({ tournamentId, games }: { tournamentId: string; games: Game[] }) {
  const router = useRouter();
  const [gameId, setGameId] = useState("");
  const [gameName, setGameName] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addTournamentGameAction(tournamentId, { gameId, gameName, thumbnail });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setGameId("");
      setGameName("");
      setThumbnail("");
      router.refresh();
    });
  }

  function handleRemove(rowId: string) {
    startTransition(async () => {
      await removeTournamentGameAction(tournamentId, rowId);
      router.refresh();
    });
  }

  const inputCls =
    "rounded-lg border border-line bg-cream-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-gold";

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {games.map((g) => (
          <li
            key={g.id}
            className="flex items-center justify-between rounded-lg border border-line-soft bg-cream-surface-2 px-3 py-2 text-sm"
          >
            <span>
              <span className="text-ink">{g.gameName}</span>{" "}
              <span className="text-ink-soft">({g.gameId})</span>
            </span>
            <button
              onClick={() => handleRemove(g.id)}
              disabled={isPending}
              className="text-xs text-danger hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
        {games.length === 0 && <li className="text-sm text-ink-soft">No games added yet.</li>}
      </ul>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-soft">Game ID</label>
          <input className={inputCls} value={gameId} onChange={(e) => setGameId(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-soft">Game name</label>
          <input className={inputCls} value={gameName} onChange={(e) => setGameName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-soft">Thumbnail URL (optional)</label>
          <input className={inputCls} value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg border border-gold px-3 py-2 text-sm text-gold-bright hover:bg-gold/10 disabled:opacity-60"
        >
          Add game
        </button>
      </form>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

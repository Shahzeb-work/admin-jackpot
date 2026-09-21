"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TournamentInput, PrizeRate } from "@/lib/actions/tournaments";

const TOURNAMENT_TYPES = ["multiplier", "winning", "wagered", "referral", "freespin"];
const COIN_MODES = ["gc", "sc", "gc_sc"];
const STATUSES = ["commingup", "active", "ended", "canceled"];

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type TournamentFormValues = TournamentInput;

const EMPTY: TournamentFormValues = {
  name: "",
  bannerUrl: "",
  startTime: "",
  endTime: "",
  tournamentType: "wagered",
  coinMode: "gc_sc",
  prizePoolGc: 0,
  prizePoolSc: 0,
  description: "",
  status: "commingup",
  winners: 20,
  prizePoolRates: [],
};

export function TournamentForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<TournamentFormValues> & { startTime?: string; endTime?: string };
  onSubmit: (values: TournamentFormValues) => Promise<{ ok: boolean; error?: string }>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<TournamentFormValues>({
    ...EMPTY,
    ...initial,
    startTime: initial?.startTime ? toLocalInput(initial.startTime) : "",
    endTime: initial?.endTime ? toLocalInput(initial.endTime) : "",
    prizePoolRates: initial?.prizePoolRates ?? [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof TournamentFormValues>(key: K, value: TournamentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function updateRate(index: number, patch: Partial<PrizeRate>) {
    setValues((v) => ({
      ...v,
      prizePoolRates: v.prizePoolRates.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  }

  function addRate() {
    setValues((v) => ({
      ...v,
      prizePoolRates: [...v.prizePoolRates, { rank: v.prizePoolRates.length + 1, gcValue: 0, scValue: 0 }],
    }));
  }

  function removeRate(index: number) {
    setValues((v) => ({ ...v, prizePoolRates: v.prizePoolRates.filter((_, i) => i !== index) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(values);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/tournaments");
      router.refresh();
    });
  }

  const inputCls =
    "rounded-lg border border-line bg-cream-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-gold";
  const labelCls = "text-xs font-medium text-ink-soft";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex flex-col gap-1">
          <label className={labelCls}>Name</label>
          <input
            className={inputCls}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className={labelCls}>Banner URL</label>
          <input
            className={inputCls}
            value={values.bannerUrl}
            onChange={(e) => set("bannerUrl", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Start time</label>
          <input
            type="datetime-local"
            className={inputCls}
            value={values.startTime}
            onChange={(e) => set("startTime", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>End time</label>
          <input
            type="datetime-local"
            className={inputCls}
            value={values.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Tournament type</label>
          <select
            className={inputCls}
            value={values.tournamentType}
            onChange={(e) => set("tournamentType", e.target.value)}
          >
            {TOURNAMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Coin mode</label>
          <select
            className={inputCls}
            value={values.coinMode}
            onChange={(e) => set("coinMode", e.target.value)}
          >
            {COIN_MODES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Status</label>
          <select
            className={inputCls}
            value={values.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Winners</label>
          <input
            type="number"
            min={1}
            className={inputCls}
            value={values.winners}
            onChange={(e) => set("winners", Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Prize pool (GC)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputCls}
            value={values.prizePoolGc}
            onChange={(e) => set("prizePoolGc", Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Prize pool (SC)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputCls}
            value={values.prizePoolSc}
            onChange={(e) => set("prizePoolSc", Number(e.target.value))}
          />
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className={labelCls}>Description</label>
          <textarea
            className={inputCls}
            rows={3}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className={labelCls}>Prize rates by rank (optional — falls back to an even split)</label>
          <button
            type="button"
            onClick={addRate}
            className="rounded-md border border-line px-2 py-1 text-xs text-ink-soft hover:border-gold hover:text-ink"
          >
            + Add rank
          </button>
        </div>
        {values.prizePoolRates.map((rate, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              className={`${inputCls} w-20`}
              value={rate.rank}
              onChange={(e) => updateRate(i, { rank: Number(e.target.value) })}
              placeholder="Rank"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputCls} flex-1`}
              value={rate.gcValue}
              onChange={(e) => updateRate(i, { gcValue: Number(e.target.value) })}
              placeholder="GC value"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputCls} flex-1`}
              value={rate.scValue}
              onChange={(e) => updateRate(i, { scValue: Number(e.target.value) })}
              placeholder="SC value"
            />
            <button
              type="button"
              onClick={() => removeRate(i)}
              className="text-xs text-danger hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-cream transition hover:bg-gold-bright disabled:opacity-60"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/tournaments")}
          className="rounded-lg border border-line px-4 py-2 text-sm text-ink-soft hover:border-gold hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

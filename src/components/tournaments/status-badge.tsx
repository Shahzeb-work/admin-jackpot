const STYLES: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  commingup: "bg-gold/15 text-gold-bright border-gold/30",
  ended: "bg-ink-soft/15 text-ink-soft border-ink-soft/30",
  canceled: "bg-danger/15 text-danger border-danger/30",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.ended;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

import type { BreakdownEntry } from "@/redux/api";

/** Horizontal value/count bars for browser/OS/device/referrer breakdowns. */
export function BreakdownBars({
  entries,
  emptyLabel = "No data yet",
}: {
  entries: BreakdownEntry[];
  emptyLabel?: string;
}) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...entries.map((entry) => entry.count), 1);
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.value}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{entry.value}</span>
            <span className="shrink-0 text-xs text-muted-foreground tabular">
              {entry.count}
              <span className="ml-1.5">
                {total > 0 ? Math.round((entry.count / total) * 100) : 0}%
              </span>
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-sm bg-muted"
            role="progressbar"
            aria-valuenow={entry.count}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={entry.value}
          >
            <div
              className="h-full rounded-sm bg-primary transition-[width] duration-700"
              style={{ width: `${Math.max((entry.count / max) * 100, 3)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

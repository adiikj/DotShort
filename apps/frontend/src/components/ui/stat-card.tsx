import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  loading?: boolean;
}

/** Metric block. The parent grid owns the dividers/surface. */
export function StatCard({ icon: Icon, label, value, hint, loading }: StatCardProps) {
  return (
    <div className="min-w-0 bg-card px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground/70" aria-hidden />
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-24" />
      ) : (
        <p
          className="mt-2 truncate text-2xl font-semibold tracking-[-0.035em] tabular"
          title={String(value)}
        >
          {value}
        </p>
      )}
      {hint && !loading ? (
        <p className="mt-1 truncate text-xs text-muted-foreground" title={hint}>
          {hint}
        </p>
      ) : (
        <div className="mt-1 h-4" />
      )}
    </div>
  );
}

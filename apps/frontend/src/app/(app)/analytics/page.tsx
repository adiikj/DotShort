"use client";

import Link from "next/link";
import { BarChart3, MousePointerClick, TrendingUp } from "lucide-react";
import { useAccountAnalyticsQuery } from "@/redux/api";
import { StatCard } from "@/components/ui/stat-card";
import { TrendArea } from "@/components/charts/trend-area";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useAccountAnalyticsQuery();

  const bestDay = data?.trend.length
    ? data.trend.reduce((best, point) => (point.clicks > best.clicks ? point : best))
    : null;
  const bestDayLabel = bestDay
    ? new Date(`${bestDay.day}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "No data";

  const breakdowns = [
    {
      title: "Top referrers",
      entries: data?.referrers ?? [],
      caption: "Where visitors came from",
    },
    { title: "Browsers", entries: data?.browsers ?? [] },
    { title: "Operating systems", entries: data?.operatingSystems ?? [] },
    { title: "Devices", entries: data?.devices ?? [] },
  ];

  const topLinks = (data?.topLinks ?? []).filter((link) => link.clickCount > 0);

  if (isError) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="font-medium">Couldn&apos;t load analytics</p>
        <p className="mt-1 text-sm text-muted-foreground">Refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Clicks across every link in your account. Last 30 days unless noted."
        actions={<span className="text-xs text-muted-foreground">Last 30 days</span>}
      />

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
        <StatCard
          icon={MousePointerClick}
          label="Clicks last 7 days"
          value={data?.clicksLast7Days ?? 0}
          loading={isLoading}
        />
        <StatCard
          icon={BarChart3}
          label="Active days"
          value={
            data
              ? data.trend.reduce((sum, point) => sum + (point.clicks > 0 ? 1 : 0), 0)
              : 0
          }
          hint="Days with at least one click"
          loading={isLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Best day"
          value={bestDayLabel}
          hint={bestDay ? `${bestDay.clicks} clicks` : "No clicks yet"}
          loading={isLoading}
        />
      </div>

      <section className="border-t pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold">Clicks over time</h2>
          <span className="text-xs text-muted-foreground">All links</span>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <TrendArea data={data?.trend ?? []} />
          )}
        </div>
      </section>

      <section className="border-t pt-6">
        <h2 className="text-base font-semibold">Where clicks come from</h2>
        <div className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
          {breakdowns.map((group) => (
            <div key={group.title} className="bg-card p-5">
              <h3 className="text-sm font-medium">{group.title}</h3>
              {group.caption ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{group.caption}</p>
              ) : null}
              <div className="mt-4">
                {isLoading ? (
                  <Skeleton className="h-32" />
                ) : (
                  <BreakdownBars entries={group.entries} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t pt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Top links</h2>
          <Link
            href="/links"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Manage links
          </Link>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : topLinks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No links with clicks yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              <ul className="divide-y">
                {topLinks.map((link) => (
                  <li key={link._id} className="flex items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/links/${link.shortCode}`}
                        className="font-mono text-sm font-medium hover:underline"
                      >
                        /{link.shortCode}
                      </Link>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {link.longUrl}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular">
                      {link.clickCount} click{link.clickCount === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

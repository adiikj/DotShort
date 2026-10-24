"use client";

import Link from "next/link";
import { BarChart3, ExternalLink, Link2, MousePointerClick, Plus, TrendingUp } from "lucide-react";
import { useOverviewQuery, type SerializedLink } from "@/redux/api";
import { StatCard } from "@/components/ui/stat-card";
import { TrendArea } from "@/components/charts/trend-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { RouteMark } from "@/components/brand/route-mark";

type LinkStatus = {
  label: string;
  variant: "destructive" | "secondary" | "outline";
};

function linkStatus(link: SerializedLink): LinkStatus | null {
  if (!link.expiresAt) return null;

  const expiresAt = new Date(link.expiresAt);
  const expired = expiresAt < new Date();
  if (expired) return { label: "Expired", variant: "destructive" };

  const withinWeek = expiresAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
  if (withinWeek) return { label: "Expires soon", variant: "secondary" };

  return {
    label: `Expires ${expiresAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}`,
    variant: "outline",
  };
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useOverviewQuery();

  if (isError) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="font-medium">Couldn&apos;t load your dashboard</p>
        <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
        <button
          onClick={() => refetch()}
          className={buttonVariants({ variant: "outline", className: "mt-5" })}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="A quick read on your links, clicks and recent activity."
        actions={
          <Link href="/links?new=1" className={buttonVariants({ className: "lg:hidden" })}>
            <Plus className="h-4 w-4" />
            New link
          </Link>
        }
      />

      {/* KPI band */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
        <StatCard
          icon={Link2}
          label="Total links"
          value={data?.totalLinks ?? 0}
          hint="In your workspace"
          loading={isLoading}
        />
        <StatCard
          icon={MousePointerClick}
          label="Total clicks"
          value={data?.totalClicks ?? 0}
          hint="Across every link"
          loading={isLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Last 7 days"
          value={data?.clicksLast7Days ?? 0}
          hint="Recent clicks"
          loading={isLoading}
        />
        <StatCard
          icon={BarChart3}
          label="Top link"
          value={data?.topLink ? `/${data.topLink.shortCode}` : "None"}
          hint={
            data?.topLink
              ? `${data.topLink.clickCount} click${data.topLink.clickCount === 1 ? "" : "s"}`
              : "No clicks yet"
          }
          loading={isLoading}
        />
      </div>

      {/* Trend */}
      <section className="border-t pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold">Clicks over time</h2>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <TrendArea data={data?.trend ?? []} />
          )}
        </div>
      </section>

      {/* Recent links */}
      <section className="border-t pt-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Recent links</h2>
          <Link
            href="/links"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (data?.recentLinks.length ?? 0) === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <RouteMark className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 font-medium">No links yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first short link to see it here.
              </p>
              <Link href="/links?new=1" className={buttonVariants({ className: "mt-4" })}>
                <Plus className="h-4 w-4" />
                Create a link
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              <ul className="divide-y">
                {(data?.recentLinks ?? []).map((link) => {
                  const status = linkStatus(link);
                  return (
                    <li key={link._id} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/links/${link.shortCode}`}
                            className="font-mono text-sm font-medium hover:underline"
                          >
                            /{link.shortCode}
                          </Link>
                          {status && <Badge variant={status.variant}>{status.label}</Badge>}
                          {link.hasPassword && <Badge variant="outline">Password</Badge>}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {link.longUrl}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground tabular">
                        {link.clickCount} click{link.clickCount === 1 ? "" : "s"}
                      </span>
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${link.shortUrl}`}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

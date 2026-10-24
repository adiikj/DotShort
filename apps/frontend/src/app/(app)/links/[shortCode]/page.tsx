"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  Copy,
  ExternalLink,
  Lock,
  MousePointerClick,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteLinkMutation, useLinkAnalyticsQuery } from "@/redux/api";
import { apiErrorMessage } from "@/lib/errors";
import { StatCard } from "@/components/ui/stat-card";
import { TrendArea } from "@/components/charts/trend-area";
import { BreakdownBars } from "@/components/charts/breakdown-bars";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";
import { LinkFormDialog } from "@/components/links/link-form-dialog";
import { PageHeader } from "@/components/layout/page-header";

function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export default function LinkDetailPage() {
  const params = useParams<{ shortCode: string }>();
  const shortCode = params.shortCode;

  const { data, isLoading, isError } = useLinkAnalyticsQuery(shortCode);
  const [deleteLink, { isLoading: isDeleting }] = useDeleteLinkMutation();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="font-medium">Link not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been deleted, or it belongs to another account.
        </p>
        <Link href="/links" className={buttonVariants({ className: "mt-5" })}>
          <ArrowLeft className="h-4 w-4" />
          Back to links
        </Link>
      </div>
    );
  }

  const { link } = data;
  const expired = Boolean(link.expiresAt && new Date(link.expiresAt) < new Date());

  const breakdowns = [
    { title: "Top referrers", entries: data.referrers, caption: "Where visitors came from" },
    { title: "Browsers", entries: data.browsers },
    { title: "Operating systems", entries: data.operatingSystems },
    { title: "Devices", entries: data.devices },
  ];

  const copy = async () => {
    await navigator.clipboard.writeText(link.shortUrl);
    toast.success("Short link copied");
  };

  const confirmDelete = async () => {
    try {
      await deleteLink(link.shortCode).unwrap();
      toast.success(`Deleted /${link.shortCode}`);
      window.location.href = "/links";
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not delete the link"));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/links"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          All links
        </Link>

        <PageHeader
          title={
            <span className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono">/{link.shortCode}</span>
              {link.hasPassword && (
                <Badge variant="outline">
                  <Lock className="mr-1 h-3 w-3" />
                  Password
                </Badge>
              )}
              {link.expiresAt && (
                <Badge variant={expired ? "destructive" : "secondary"}>
                  {expired ? "Expired" : `Expires ${formatDateTime(link.expiresAt)}`}
                </Badge>
              )}
            </span>
          }
          description={
            <span className="flex flex-col gap-1">
              <a
                href={link.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
              >
                {link.shortUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="max-w-xl truncate" title={link.longUrl}>
                → {link.longUrl}
              </span>
            </span>
          }
          actions={
            <>
              <Button variant="outline" onClick={copy}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" onClick={() => setShowEdit(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
        <StatCard
          icon={MousePointerClick}
          label="Total clicks"
          value={data.totalClicks}
          hint="Since the link was created"
        />
        <StatCard icon={TrendingUp} label="Last 7 days" value={data.clicksLast7Days} />
        <StatCard
          icon={CalendarPlus}
          label="Created"
          value={formatDateTime(link.createdAt)}
          hint={link.expiresAt ? `Expires ${formatDateTime(link.expiresAt)}` : "Never expires"}
        />
      </div>

      <section className="border-t pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold">Clicks over time</h2>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <div className="mt-4">
          <TrendArea data={data.trend} />
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
                <BreakdownBars entries={group.entries} emptyLabel="No data yet" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold">Recent clicks</h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Latest {data.recentClicks.length}
          </span>
        </div>
        <div className="mt-4">
          {data.recentClicks.length === 0 ? (
            <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              No clicks recorded yet. Share the link to see visits here.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead className="hidden sm:table-cell">OS</TableHead>
                    <TableHead className="hidden sm:table-cell">Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentClicks.map((click, index) => (
                    <TableRow key={`${click.clickedAt}-${index}`}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(click.clickedAt)}
                      </TableCell>
                      <TableCell>{click.referrer ?? "Direct"}</TableCell>
                      <TableCell>{click.browser ?? "Unknown"}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {click.os ?? "Unknown"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {click.device ?? "Unknown"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>

      <LinkFormDialog open={showEdit} link={link} onClose={() => setShowEdit(false)} />

      <Dialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title={`Delete /${link.shortCode}?`}
        description="This permanently removes the link and its click history. It can't be undone."
        className="max-w-md"
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete link"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

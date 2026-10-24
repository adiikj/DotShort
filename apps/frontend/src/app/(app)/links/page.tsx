"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  Copy,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteLinkMutation, useLinksQuery, type SerializedLink } from "@/redux/api";
import { apiErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LinkFormDialog } from "@/components/links/link-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { RouteMark } from "@/components/brand/route-mark";

function formatDate(value: string | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function DeleteConfirmDialog({
  link,
  onClose,
}: {
  link: SerializedLink | null;
  onClose: () => void;
}) {
  const [deleteLink, { isLoading }] = useDeleteLinkMutation();

  const confirm = async () => {
    if (!link) return;
    try {
      await deleteLink(link.shortCode).unwrap();
      toast.success(`Deleted /${link.shortCode}`);
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not delete the link"));
    }
  };

  return (
    <Dialog
      open={Boolean(link)}
      onClose={onClose}
      title={`Delete /${link?.shortCode ?? ""}?`}
      description="This permanently removes the link and its click history. It can't be undone."
      className="max-w-md"
    >
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={confirm} disabled={isLoading}>
          {isLoading ? "Deleting…" : "Delete link"}
        </Button>
      </div>
    </Dialog>
  );
}

function LinkActions({
  link,
  onCopy,
  onEdit,
  onDelete,
  className,
}: {
  link: SerializedLink;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 items-center justify-end gap-0.5", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Copy short link"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Link
        href={`/links/${link.shortCode}`}
        aria-label="View analytics"
        className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
      >
        <BarChart3 className="h-4 w-4" />
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Edit link"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        aria-label="Delete link"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function LinksPageInner() {
  const searchParams = useSearchParams();
  const { data, isLoading, isError } = useLinksQuery();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<SerializedLink | null>(null);
  const [deleting, setDeleting] = useState<SerializedLink | null>(null);

  // /links?new=1 opens the create dialog (used by the dashboard CTA).
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowCreate(true);
    }
  }, [searchParams]);

  const links = data?.links ?? [];
  const filtered = search.trim()
    ? links.filter(
        (link) =>
          link.shortCode.toLowerCase().includes(search.toLowerCase()) ||
          link.longUrl.toLowerCase().includes(search.toLowerCase())
      )
    : links;

  const copy = async (link: SerializedLink) => {
    await navigator.clipboard.writeText(link.shortUrl);
    toast.success("Short link copied");
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Links"
        description={`${links.length} link${links.length === 1 ? "" : "s"} in your account.`}
        actions={
          <Button className="lg:hidden" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            New link
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search code or destination"
            className="h-9 pl-9"
            aria-label="Search links"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} shown
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Couldn&apos;t load your links. Refresh the page to try again.
        </p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <RouteMark className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-medium">{search ? "No matches" : "No links yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "Create your first short link."}
          </p>
          {!search && (
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create a link
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Compact rows on phones; the table needs more width than a phone has. */}
          <div className="divide-y overflow-hidden rounded-lg border bg-card sm:hidden">
            {filtered.map((link) => {
              const expired = Boolean(link.expiresAt && new Date(link.expiresAt) < new Date());
              return (
                <div key={link._id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/links/${link.shortCode}`}
                          className="whitespace-nowrap font-mono text-sm font-medium hover:underline"
                        >
                          /{link.shortCode}
                        </Link>
                        {link.hasPassword && <Badge variant="outline">Password</Badge>}
                        {link.expiresAt && (
                          <Badge variant={expired ? "destructive" : "secondary"}>
                            {expired ? "Expired" : formatDate(link.expiresAt)}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1.5 truncate text-xs text-muted-foreground">
                        {link.longUrl}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {link.clickCount} click{link.clickCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <LinkActions
                      link={link}
                      onCopy={() => copy(link)}
                      onEdit={() => setEditing(link)}
                      onDelete={() => setDeleting(link)}
                      className="-mr-2 -mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-lg border bg-card sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-14 sm:table-cell">QR</TableHead>
                  <TableHead>Short link</TableHead>
                  <TableHead className="hidden md:table-cell">Destination</TableHead>
                  <TableHead className="w-20">Clicks</TableHead>
                  <TableHead className="hidden w-32 lg:table-cell">Created</TableHead>
                  <TableHead className="hidden w-36 lg:table-cell">Expires</TableHead>
                  <TableHead className="w-36 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((link) => {
                  const expired = Boolean(link.expiresAt && new Date(link.expiresAt) < new Date());
                  return (
                    <TableRow key={link._id}>
                      <TableCell className="hidden sm:table-cell">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={link.qrCode}
                          alt={`QR code for /${link.shortCode}`}
                          className="h-8 w-8 rounded border bg-white p-0.5"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/links/${link.shortCode}`}
                            className="whitespace-nowrap font-mono text-sm font-medium hover:underline"
                          >
                            /{link.shortCode}
                          </Link>
                          {link.hasPassword && <Badge variant="outline">Password</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-xs md:table-cell">
                        <a
                          href={link.longUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
                          title={link.longUrl}
                        >
                          <span className="truncate">{link.longUrl}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell className="text-sm tabular">{link.clickCount}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {formatDate(link.createdAt)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {link.expiresAt ? (
                          <Badge variant={expired ? "destructive" : "secondary"}>
                            {expired ? "Expired" : formatDate(link.expiresAt)}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <LinkActions
                          link={link}
                          onCopy={() => copy(link)}
                          onEdit={() => setEditing(link)}
                          onDelete={() => setDeleting(link)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <LinkFormDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <LinkFormDialog open={Boolean(editing)} link={editing} onClose={() => setEditing(null)} />
      <DeleteConfirmDialog link={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

export default function LinksPage() {
  return (
    <Suspense>
      <LinksPageInner />
    </Suspense>
  );
}

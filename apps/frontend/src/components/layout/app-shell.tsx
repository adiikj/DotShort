"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Plus,
  QrCode,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearSession, getAccessToken } from "@/lib/auth";
import { logoutUser } from "@/api/api";
import { useProfileQuery } from "@/redux/api";
import { Logo } from "@/components/brand/logo";
import { BuiltBy } from "@/components/layout/built-by";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/qr", label: "QR Studio", icon: QrCode },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function useLogout() {
  const router = useRouter();

  return () => {
    // Revoke server-side; ignore network failures and clear locally either way.
    if (getAccessToken()) {
      logoutUser().catch(() => undefined);
    }
    clearSession();
    router.push("/");
    router.refresh();
  };
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Workspace">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileBlock({ onNavigate }: { onNavigate?: () => void }) {
  const { data: profile } = useProfileQuery();
  const logout = useLogout();

  const name = profile?.name ?? "…";
  const email = profile?.email ?? "";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="border-t p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label="Log out"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Logo href="/dashboard" />
          <ThemeToggle />
        </div>

        <div className="p-3">
          <Link
            href="/links?new=1"
            className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New link
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-3 pb-2 pt-2 text-xs text-muted-foreground">Workspace</p>
          <NavList />
        </div>

        <ProfileBlock />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="flex h-full w-64 flex-col border-r bg-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b px-5">
              <Logo href="/dashboard" />
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3">
              <Link
                href="/links?new=1"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                New link
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <p className="px-3 pb-2 pt-2 text-xs text-muted-foreground">Workspace</p>
              <NavList onNavigate={() => setMobileOpen(false)} />
            </div>
            <ProfileBlock onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="flex min-h-screen flex-col lg:pl-60">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:hidden">
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo href="/dashboard" />
          <ThemeToggle />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          {children}
        </main>
        <footer className="border-t">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
            <span>© {new Date().getFullYear()} DotShort</span>
            <BuiltBy />
          </div>
        </footer>
      </div>
    </div>
  );
}

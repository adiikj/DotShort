import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LinkRoute } from "@/components/illustrations/link-route";
import { BuiltBy } from "@/components/layout/built-by";
import { ThemeToggle } from "@/components/theme-toggle";

const FACTS = [
  "Custom codes you can read out loud",
  "A QR code with every link",
  "Clicks, referrers and devices",
] as const;

export default function AuthLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="hidden border-r bg-card p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Logo />

        <div className="max-w-md">
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.055em]">
            Short your dot<span className="text-signal">.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            Short links, QR codes and click reports. Keep the useful parts of a link in one place.
          </p>
          <div className="mt-8">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Long link</span>
              <span>Short link</span>
            </div>
            <LinkRoute className="mt-1 h-14 text-primary/75" />
          </div>
          <ul className="mt-6 border-t">
            {FACTS.map((fact) => (
              <li key={fact} className="border-b py-3 text-sm text-muted-foreground">
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">© {year} DotShort</p>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between px-5 sm:px-8">
          <Logo className="lg:hidden" />
          <Link
            href="/"
            className="hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          {children}
        </main>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-5 text-xs text-muted-foreground sm:px-8">
          <span className="lg:hidden">© {year} DotShort</span>
          <BuiltBy className="ml-auto" />
          <span>Short your dot.</span>
        </footer>
      </div>
    </div>
  );
}

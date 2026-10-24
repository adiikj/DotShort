import type { ComponentType } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ChartGlyph, CodeGlyph, LockGlyph, QrGlyph, TimerGlyph } from "@/components/brand/glyphs";
import { LinkRoute } from "@/components/illustrations/link-route";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { HeroInput } from "@/components/landing/hero-input";

export const metadata: Metadata = {
  title: { absolute: "Short your dot. · DotShort" },
  description:
    "DotShort turns long URLs into short links with QR codes, password gates and click analytics. No account needed to start.",
};

interface Feature {
  title: string;
  body: string;
  glyph: ComponentType<{ className?: string }>;
  example?: string;
}

const FEATURES: Feature[] = [
  {
    title: "Custom short codes",
    body: "Pick a code you can say out loud. A readable link is easier to share, print and remember.",
    glyph: CodeGlyph,
    example: "ds.to/launch",
  },
  {
    title: "QR codes",
    body: "Every link comes with a QR code, ready to download and put on anything you can print.",
    glyph: QrGlyph,
  },
  {
    title: "Password gates",
    body: "Put a password in front of the redirect. Useful for previews, client work and private documents.",
    glyph: LockGlyph,
  },
  {
    title: "Expiry windows",
    body: "Close a link after an hour, a week or a year. Expired links clean themselves up.",
    glyph: TimerGlyph,
  },
  {
    title: "Click reports",
    body: "See total clicks, referrers, browsers, operating systems and devices for every link.",
    glyph: ChartGlyph,
  },
];

const STEPS = [
  {
    title: "Paste the URL",
    body: "Drop in any long link. No account is needed to make one.",
  },
  {
    title: "Get your short link",
    body: "Take the generated code, or sign in to claim a custom one.",
  },
  {
    title: "Share and check",
    body: "Send the link or its QR code. Clicks and referrers show up in your dashboard.",
  },
] as const;

function SampleChart() {
  return (
    <div className="mt-4">
      <svg
        viewBox="0 0 800 150"
        className="h-36 w-full"
        role="img"
        aria-label="Sample line chart of clicks over thirty days"
        preserveAspectRatio="none"
      >
        {[30, 70, 110].map((y) => (
          <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#94a3b8" strokeOpacity="0.18" />
        ))}
        <path
          d="M0 122 L60 116 L120 118 L180 96 L240 104 L300 82 L360 88 L420 62 L480 70 L540 44 L600 52 L660 26 L720 34 L800 12"
          fill="none"
          stroke="#1f8a63"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="800" cy="12" r="3.5" fill="#e8621d" stroke="#fff" strokeWidth="1.5" />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>Sep 25</span>
        <span>Oct 10</span>
        <span>Oct 24</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-9">
            <Logo />
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <a href="#features" className="transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#analytics" className="transition-colors hover:text-foreground">
                Analytics
              </a>
              <a href="#how" className="transition-colors hover:text-foreground">
                How it works
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/signin"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link href="/signup" className={buttonVariants({ className: "h-9" })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b">
          <div className="container-page grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="py-14 lg:py-24 lg:pr-16">
              <h1 className="text-[clamp(2.75rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.055em]">
                Short your dot<span className="text-signal">.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Turn a long URL into a short link, a QR code and a click report. No account needed
                to start.
              </p>

              <div className="mt-10 max-w-md">
                <p className="break-words font-mono text-xs text-muted-foreground line-through decoration-muted-foreground/40">
                  https://long-link.example/notes/the-long-way-around
                </p>
                <LinkRoute className="mt-1 h-20 text-primary/75" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">One destination</span>
                  <span className="font-mono text-base font-medium text-primary">ds.to/notes</span>
                </div>
              </div>

              <p className="mt-10 max-w-md text-sm leading-relaxed text-muted-foreground">
                Custom codes, QR codes, password gates and expiry. One link, all the useful parts.
              </p>
            </div>

            <div className="border-t bg-card py-10 lg:flex lg:items-center lg:border-l lg:border-t-0 lg:px-16 lg:py-16">
              <HeroInput />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container-page scroll-mt-20 py-20">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                A short link is only the beginning.
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                DotShort keeps the useful parts of a link together: the code, the QR, the privacy
                and the numbers. Nothing else.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Create an account
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div>
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.title}
                  className="grid gap-3 border-t py-7 first:border-t-0 first:pt-0 sm:grid-cols-[40px_1fr] sm:gap-6"
                >
                  <span className="text-sm text-muted-foreground tabular">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <feature.glyph className="h-5 w-5 shrink-0 text-primary" />
                      <h3 className="text-lg font-semibold tracking-[-0.02em]">{feature.title}</h3>
                    </div>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                    {feature.example ? (
                      <p className="mt-3 font-mono text-sm text-primary">{feature.example}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section id="analytics" className="scroll-mt-20 border-y bg-card">
          <div className="container-page py-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Know which links people actually use.
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  Every link gets a click report. See when people arrive, where they came from and
                  what they used, without opening five different tools.
                </p>
              </div>
              <Link
                href="/signup"
                className={buttonVariants({ variant: "outline", className: "self-start sm:self-auto" })}
              >
                Open analytics
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 overflow-hidden rounded-lg border bg-background">
              <div className="grid grid-cols-2 divide-x border-b sm:grid-cols-4">
                {[
                  ["Total clicks", "1,284"],
                  ["Last 7 days", "186"],
                  ["Top link", "/launch"],
                  ["Top source", "Direct"],
                ].map(([label, value]) => (
                  <div key={label} className="px-4 py-4 sm:px-5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 truncate text-xl font-semibold tracking-[-0.03em] tabular">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-b p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">Clicks over time</p>
                  <span className="text-xs text-muted-foreground">Last 30 days · sample</span>
                </div>
                <SampleChart />
              </div>

              <div className="grid gap-6 p-5 sm:grid-cols-3">
                {[
                  {
                    title: "Top referrers",
                    rows: [
                      ["google.com", "42"],
                      ["Direct", "31"],
                      ["news.ycombinator.com", "18"],
                    ],
                  },
                  {
                    title: "Browsers",
                    rows: [
                      ["Chrome", "61"],
                      ["Safari", "24"],
                      ["Firefox", "9"],
                    ],
                  },
                  {
                    title: "Devices",
                    rows: [
                      ["Mobile", "58"],
                      ["Desktop", "37"],
                      ["Tablet", "5"],
                    ],
                  },
                ].map((group) => (
                  <div key={group.title}>
                    <p className="text-sm font-medium">{group.title}</p>
                    <ul className="mt-3 space-y-2.5">
                      {group.rows.map(([label, value]) => (
                        <li key={label} className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="truncate text-muted-foreground">{label}</span>
                          <span className="shrink-0 tabular">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              An illustrative sample. Your dashboard shows data from your own links.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="container-page scroll-mt-20 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Three steps, no setup.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              You do not need an account to make a link. You only need one to keep it.
            </p>
          </div>

          <div className="relative mt-10 hidden h-px bg-border sm:block">
            <span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-primary" />
            <span className="absolute -top-1 left-1/3 h-2 w-2 rounded-full bg-primary" />
            <span className="absolute -top-1 left-2/3 h-2 w-2 rounded-full bg-primary" />
            <span className="absolute -top-1.5 right-0 h-3 w-3 rounded-full bg-signal" />
          </div>

          <div className="mt-6 grid gap-8 border-t pt-8 sm:grid-cols-3 sm:border-t-0 sm:pt-0">
            {STEPS.map((step, index) => (
              <div key={step.title}>
                <span className="text-sm text-muted-foreground tabular">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container-page pb-20">
          <div className="rounded-lg bg-primary px-8 py-12 text-primary-foreground sm:px-12">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Make the next link shorter.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
                  Free to start. No card required. Keep the links you care about in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-[#0d1119] transition-colors hover:bg-white/90"
                >
                  Create an account
                </Link>
                <Link
                  href="/signin"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-white/30 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container-page py-10">
          <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Short links with QR codes and click reports. No clutter.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Product</p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ["Features", "#features"],
                  ["Analytics", "#analytics"],
                  ["How it works", "#how"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Account</p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ["Sign in", "/signin"],
                  ["Create account", "/signup"],
                  ["Dashboard", "/dashboard"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-between gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row">
            <span>© {year} DotShort</span>
            <span>Short your dot.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

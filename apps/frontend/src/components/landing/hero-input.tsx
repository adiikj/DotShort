"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useShortenMutation } from "@/redux/api";
import { apiErrorMessage, apiErrorShape } from "@/lib/errors";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShortenResult {
  shortUrl: string;
  qrCode: string;
}

export function HeroInput() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [shorten, { isLoading }] = useShortenMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;

    try {
      const created = await shorten({ longUrl: url.trim() }).unwrap();
      setResult({ shortUrl: created.shortUrl, qrCode: created.qrCode });
      setCopied(false);
    } catch (error) {
      const details = apiErrorShape(error).errors;
      toast.error(apiErrorMessage(error, "Could not shorten that URL."), {
        description: details?.join("\n"),
      });
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    toast.success("Short link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Shorten a link</h2>
        <span className="text-xs text-muted-foreground">No account needed</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5">
        <Label htmlFor="hero-url" className="text-[13px] font-medium">
          Destination URL
        </Label>
        <Input
          id="hero-url"
          type="url"
          inputMode="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://your-long-link.com/..."
          className="mt-2 h-11"
        />
        <Button type="submit" size="lg" disabled={isLoading} className="mt-3 w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Shortening…
            </>
          ) : (
            "Shorten link"
          )}
        </Button>
      </form>

      <div className="mt-6 border-t pt-5" aria-live="polite">
        {result ? (
          <div className="animate-scale-in">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.qrCode}
                alt="QR code for your short link"
                className="h-16 w-16 shrink-0 rounded-md border bg-white p-1"
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Your short link</p>
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 font-mono text-sm font-medium text-primary hover:underline"
                >
                  <span className="truncate">{result.shortUrl}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </a>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Copy it, or open the QR code.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={copy} className="flex-1">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "sm", className: "flex-1" })}
              >
                Open link
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <Link
              href="/signup"
              className="mt-3 inline-flex text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Create an account to keep your links
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing to install. Paste a link and press Shorten.
          </p>
        )}
      </div>
    </div>
  );
}

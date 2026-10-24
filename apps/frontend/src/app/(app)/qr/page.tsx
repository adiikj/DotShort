"use client";

import { useState } from "react";
import { Copy, Download, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useLinksQuery, useShortenMutation } from "@/redux/api";
import { apiErrorMessage } from "@/lib/errors";
import { ScanCorners } from "@/components/illustrations/scan-corners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";

export default function QrStudioPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; qrCode: string } | null>(null);
  const [shorten, { isLoading }] = useShortenMutation();
  const { data: linksData } = useLinksQuery();

  const generate = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    try {
      const created = await shorten({ longUrl: targetUrl.trim() }).unwrap();
      setResult({ shortUrl: created.shortUrl, qrCode: created.qrCode });
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not generate a QR code."));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await generate(url);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    toast.success("Short link copied");
  };

  const download = () => {
    if (!result) return;
    const anchor = document.createElement("a");
    anchor.href = result.qrCode;
    anchor.download = `qr-${Date.now()}.png`;
    anchor.click();
    toast.success("QR code downloaded");
  };

  const recentLinks = (linksData?.links ?? []).slice(0, 6);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="QR Studio"
        description="Turn a URL into a short link with a matching QR code. Generated links are saved to your account."
      />

      <div className="rounded-lg border bg-card p-5">
        <form onSubmit={handleSubmit}>
          <Label htmlFor="qr-url" className="text-[13px] font-medium">
            URL to encode
          </Label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id="qr-url"
              type="url"
              inputMode="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/whatever"
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading} className="shrink-0">
              <QrCode className="h-4 w-4" />
              {isLoading ? "Generating…" : "Generate"}
            </Button>
          </div>
        </form>

        {result && (
          <div className="mt-6 flex animate-scale-in flex-col items-center gap-4 border-t pt-6">
            <div className="relative p-3">
              <ScanCorners className="pointer-events-none absolute inset-0 text-primary/50" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.qrCode}
                alt="Generated QR code"
                className="h-52 w-52 rounded-md border bg-white p-2"
              />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-signal" />
            </div>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-medium text-primary hover:underline"
            >
              {result.shortUrl}
            </a>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copy}>
                <Copy className="h-4 w-4" />
                Copy link
              </Button>
              <Button onClick={download}>
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
            </div>
          </div>
        )}
      </div>

      {recentLinks.length > 0 && (
        <section className="border-t pt-6">
          <h2 className="text-base font-semibold">From your links</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download the QR code for a link you already made.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recentLinks.map((link) => (
              <li
                key={link._id}
                className="flex flex-col items-center gap-2 rounded-lg border bg-card p-3 text-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={link.qrCode}
                  alt={`QR code for /${link.shortCode}`}
                  className="h-24 w-24 rounded border bg-white p-1"
                />
                <span className="font-mono text-xs font-medium">/{link.shortCode}</span>
                <a
                  href={link.qrCode}
                  download={`qr-${link.shortCode}.png`}
                  className="text-xs text-primary hover:underline"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

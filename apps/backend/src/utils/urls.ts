import type { Request } from "express";

/**
 * Resolve the externally-visible base URL. Prefers APP_BASE_URL (set this in
 * production so stored/generated links survive domain moves); falls back to
 * the incoming request's host.
 */
export function resolveBaseUrl(req: Request): string {
  const configured = process.env.APP_BASE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  return `${req.protocol}://${req.get("host")}`;
}

export function buildShortUrl(req: Request, shortCode: string): string {
  return `${resolveBaseUrl(req)}/${shortCode}`;
}

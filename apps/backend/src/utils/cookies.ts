import type { CookieOptions } from "express";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

const isProduction = process.env.NODE_ENV === "production";

/** Base attributes shared by set and clear so cookies can always be removed again. */
export const authCookieBaseOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

/** Parse jwt-style expiries ("15m", "1d", "3600s") into milliseconds for cookie maxAge. */
export function parseExpiryMs(value: string | undefined, fallbackMs: number): number {
  if (!value) return fallbackMs;
  const match = /^(\d+)\s*([smhd])$/i.exec(value.trim());
  if (!match) return fallbackMs;
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return Number(match[1]) * units[match[2].toLowerCase()];
}

export function accessTokenCookieOptions(): CookieOptions {
  return {
    ...authCookieBaseOptions,
    maxAge: parseExpiryMs(process.env.ACCESS_TOKEN_EXPIRY, 15 * 60 * 1000),
  };
}

export function refreshTokenCookieOptions(): CookieOptions {
  return {
    ...authCookieBaseOptions,
    maxAge: parseExpiryMs(process.env.REFRESH_TOKEN_EXPIRY, 10 * 24 * 60 * 60 * 1000),
  };
}

import crypto from "crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DEFAULT_LENGTH = 7;

/** Generate a cryptographically random, URL-safe short code. */
export function generateShortCode(length = DEFAULT_LENGTH): string {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

/** Codes that would collide with API/infra routes and can never be claimed. */
export const RESERVED_SHORT_CODES = new Set([
  "shorten",
  "user",
  "overview",
  "analytics",
  "links",
  "api",
  "health",
  "delete",
  "qr",
  "dashboard",
  "admin",
  "login",
  "logout",
  "register",
  "refresh",
  "validate-password",
  "user-links",
  "static",
  "public",
  "assets",
  "robots.txt",
  "favicon.ico",
]);

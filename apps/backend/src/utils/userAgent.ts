import crypto from "crypto";

export interface ParsedUserAgent {
  device: string;
  os: string;
  browser: string;
}

/** Best-effort browser/os/device classification from a User-Agent string. */
export const parseUserAgent = (ua: string | undefined): ParsedUserAgent => {
  if (!ua) {
    return { device: "Unknown", os: "Unknown", browser: "Unknown" };
  }

  let browser = "Other";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = "Safari";

  let os = "Other";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod|iOS/.test(ua)) os = "iOS";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let device = "Desktop";
  if (/iPad|Tablet/.test(ua)) device = "Tablet";
  else if (/Mobi|Android|iPhone|iPod/.test(ua)) device = "Mobile";

  return { device, os, browser };
};

/** Turn a referrer header into a readable label ("Direct" for none). */
export const normalizeReferrer = (referrer: string | null | undefined): string => {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 100);
  }
};

/** Salted, truncated hash of the client IP: never store raw IPs. */
export const hashIp = (ip: string | undefined): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET ?? "dotshort-dev-salt";
  return crypto.createHash("sha256").update(`${ip ?? "unknown"}:${secret}`).digest("hex").slice(0, 32);
};

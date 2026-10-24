import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
// Non-sensitive flag read by middleware.ts to guard dashboard routes. The real
// tokens stay in localStorage (full httpOnly-cookie auth lands in Phase 2).
const SESSION_FLAG_COOKIE = "ds_session";

const cookieFlags = () => ({
  expires: 1,
  sameSite: "lax" as const,
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
});

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setSession(tokens: { accessToken: string; refreshToken?: string }): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
  Cookies.set(SESSION_FLAG_COOKIE, "1", cookieFlags());
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  Cookies.remove(SESSION_FLAG_COOKIE, { ...cookieFlags(), expires: undefined, path: "/" });
}

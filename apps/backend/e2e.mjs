/* Temporary E2E suite. Run with: node e2e.mjs (server must be up on :8000) */
const API = process.env.API_URL || "http://localhost:8000";
let failures = 0;
let passes = 0;
const check = (name, cond, extra = "") => {
  if (cond) passes++;
  else failures++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond || !extra ? "" : `: ${extra}`}`);
};

const req = async (path, { method = "GET", body, token, redirect = "follow" } = {}) => {
  try {
    const res = await fetch(API + path, {
      method,
      redirect,
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      /* non-JSON (e.g. 410 HTML from rate limiter) */
    }
    return { status: res.status, data, headers: res.headers };
  } catch (error) {
    return { status: 0, data: null, error: String(error) };
  }
};

const stamp = Date.now().toString(36);
const emailA = `alice+${stamp}@example.com`;
const passA = "Str0ngPass!A";
const userA = `alice_${stamp}`;
const emailB = `bob+${stamp}@example.com`;
const passB = "Str0ngPass!B";
const userB = `bob_${stamp}`;

const longUrlA = "https://example.com/some/destination?campaign=e2e";
const longUrlNew = "https://example.org/redirected-after-patch";
const customCode = `e2e-${stamp}`;

// ---------- registration ----------
let r = await req("/user/register", {
  method: "POST",
  body: { name: "Alice", username: userA, email: emailA, password: passA },
});
check("register user A → 201", r.status === 201, `got ${r.status}`);

r = await req("/user/register", {
  method: "POST",
  body: { name: "Alice", username: userA, email: emailA, password: passA },
});
check("duplicate register → 409", r.status === 409, `got ${r.status}`);

r = await req("/user/register", {
  method: "POST",
  body: { name: "Weak", username: `weak_${stamp}`, email: `weak@${stamp}.com`, password: "short" },
});
check("weak password → 400 with field errors", r.status === 400 && r.data?.errors?.length > 0, `got ${r.status}`);

// ---------- login: security properties ----------
r = await req("/user/login", { method: "POST", body: { emailOrUsername: emailA, password: "wrong-pass" } });
const wrongPassMsg = r.data?.message;
check("wrong password → 401 Invalid credentials", r.status === 401 && wrongPassMsg === "Invalid credentials", `got ${r.status} ${wrongPassMsg}`);

r = await req("/user/login", { method: "POST", body: { emailOrUsername: `nobody-${stamp}@x.com`, password: "whatever" } });
check("unknown user → 401, same message (no enumeration)", r.status === 401 && r.data?.message === wrongPassMsg, `got ${r.status} ${r.data?.message}`);

r = await req("/user/login", { method: "POST", body: { emailOrUsername: { $gt: "" }, password: "x" } });
check("NoSQL-style injection body → 400", r.status === 400, `got ${r.status}`);

r = await req("/user/login", { method: "POST", body: { emailOrUsername: emailA, password: passA } });
check("valid login → 200 with tokens", r.status === 200 && !!r.data?.data?.accessToken && !!r.data?.data?.refreshToken, `got ${r.status}`);
const tokenA = r.data?.data?.accessToken;
const refreshA = r.data?.data?.refreshToken;

// ---------- shorten ----------
r = await req("/shorten", { method: "POST", token: tokenA, body: { longUrl: longUrlA, shortCode: customCode } });
check("custom short code → 201", r.status === 201 && r.data?.data?.shortCode === customCode, `got ${r.status}`);
check("create returns QR data URL", (r.data?.data?.qrCode || "").startsWith("data:image/png;base64,"));

r = await req("/shorten", { method: "POST", token: tokenA, body: { longUrl: longUrlA, shortCode: customCode } });
check("duplicate custom code → 409", r.status === 409, `got ${r.status}`);

r = await req("/shorten", { method: "POST", token: tokenA, body: { longUrl: "javascript:alert(1)", shortCode: `js-${stamp}` } });
check("javascript: URL → 400", r.status === 400, `got ${r.status}`);

r = await req("/shorten", { method: "POST", token: tokenA, body: { longUrl: longUrlA, shortCode: "analytics" } });
check("reserved code → 400", r.status === 400, `got ${r.status}`);

r = await req("/shorten", { method: "POST", body: { longUrl: `https://example.com/anonymous-${stamp}` } });
check("anonymous shorten → 201", r.status === 201, `got ${r.status}`);

r = await req("/shorten", { method: "POST", token: tokenA, body: { longUrl: longUrlA, shortCode: { $ne: null } } });
check("injection body on shorten → 400", r.status === 400, `got ${r.status}`);

// ---------- redirect + click tracking ----------
for (let i = 0; i < 3; i++) {
  r = await req(`/${customCode}`, { redirect: "manual" });
  if (i === 0) {
    check("redirect → 302 to destination", r.status === 302 && r.headers.get("location") === longUrlA, `got ${r.status} ${r.headers.get("location")}`);
  }
}
await new Promise((resolve) => setTimeout(resolve, 400)); // clicks are recorded async

r = await req("/overview", { token: tokenA });
const ov = r.data?.data;
check("overview → 200 with stats", r.status === 200 && typeof ov?.totalLinks === "number", `got ${r.status}`);
check("overview counts this user's links", (ov?.totalLinks ?? 0) >= 1, `totalLinks=${ov?.totalLinks}`);
check("overview totalClicks >= 3 from redirects", (ov?.totalClicks ?? 0) >= 3, `totalClicks=${ov?.totalClicks}`);
check("overview trend is a day-bucketed array", Array.isArray(ov?.trend) && (ov.trend.length === 0 || /^\d{4}-\d{2}-\d{2}$/.test(ov.trend[0].day)), JSON.stringify(ov?.trend?.[0]));
check("overview recentLinks populated", (ov?.recentLinks?.length ?? 0) >= 1);
check("overview topLink present", ov?.topLink?.shortCode === customCode, `top=${ov?.topLink?.shortCode}`);

// ---------- per-link analytics ----------
r = await req(`/links/${customCode}/analytics`, { token: tokenA });
const la = r.data?.data;
check("link analytics → 200", r.status === 200, `got ${r.status}`);
check("link analytics totalClicks = 3", la?.totalClicks === 3, `got ${la?.totalClicks}`);
check("link analytics trend bucketed", Array.isArray(la?.trend));
check("browser breakdown present", Array.isArray(la?.browsers) && la.browsers.length >= 1, JSON.stringify(la?.browsers));
check("device breakdown present", Array.isArray(la?.devices) && la.devices.length >= 1);
check("referrer breakdown present", Array.isArray(la?.referrers));
check("recentClicks has 3 entries", (la?.recentClicks?.length ?? 0) === 3, `got ${la?.recentClicks?.length}`);
check("link serialized without password hash", la?.link?.hasPassword === false && !("passwordHash" in (la?.link ?? {})));

// ---------- account analytics ----------
r = await req("/analytics", { token: tokenA });
check("account analytics → 200 with trend/topLinks", r.status === 200 && Array.isArray(r.data?.data?.trend) && Array.isArray(r.data?.data?.topLinks), `got ${r.status}`);

// ---------- link edit (PATCH) ----------
r = await req(`/links/${customCode}`, { method: "PATCH", token: tokenA, body: { longUrl: longUrlNew, expireInHours: 1 } });
check("PATCH link → 200 with updated destination", r.status === 200 && r.data?.data?.longUrl === longUrlNew, `got ${r.status} ${r.data?.data?.longUrl}`);

r = await req(`/${customCode}`, { redirect: "manual" });
check("redirect follows edited destination", r.status === 302 && r.headers.get("location") === longUrlNew, `got ${r.status} ${r.headers.get("location")}`);

r = await req(`/links/${customCode}`, { method: "PATCH", token: tokenA, body: { expireInHours: null } });
check("PATCH clears expiration", r.status === 200 && r.data?.data?.expiresAt === null, `got ${r.status}`);

r = await req(`/links/${customCode}`, { method: "PATCH", token: tokenA, body: {} });
check("PATCH with nothing → 400", r.status === 400, `got ${r.status}`);

// ---------- password-protected link ----------
const protectedCode = `pw-${stamp}`;
r = await req("/shorten", { method: "POST", token: tokenA, body: { longUrl: "https://example.com/protected", shortCode: protectedCode, password: "sekret123" } });
check("protected link created → hasPassword", r.status === 201);

r = await req("/validate-password", { method: "POST", body: { shortCode: protectedCode, password: "wrong" } });
check("wrong link password → 401", r.status === 401, `got ${r.status}`);

r = await req("/validate-password", { method: "POST", body: { shortCode: protectedCode, password: "sekret123" } });
check("correct link password → 200 + destination", r.status === 200 && r.data?.data?.longUrl === "https://example.com/protected", `got ${r.status}`);

// ---------- ownership: user B cannot touch A's link ----------
r = await req("/user/register", {
  method: "POST",
  body: { name: "Bob", username: userB, email: emailB, password: passB },
});
check("register user B → 201", r.status === 201, `got ${r.status}`);

r = await req("/user/login", { method: "POST", body: { emailOrUsername: emailB, password: passB } });
const tokenB = r.data?.data?.accessToken;
check("login user B → 200", r.status === 200, `got ${r.status}`);

r = await req(`/delete/${customCode}`, { method: "DELETE", token: tokenB });
check("user B deleting A's link → 404", r.status === 404, `got ${r.status}`);

r = await req(`/links/${customCode}/analytics`, { token: tokenB });
check("user B reading A's analytics → 404", r.status === 404, `got ${r.status}`);

r = await req(`/links/${customCode}`, { method: "PATCH", token: tokenB, body: { longUrl: "https://evil.example" } });
check("user B patching A's link → 404", r.status === 404, `got ${r.status}`);

// ---------- refresh token rotation ----------
r = await req("/user/refresh", { method: "POST", body: { refreshToken: refreshA } });
check("refresh with valid token → 200 new pair", r.status === 200 && !!r.data?.data?.accessToken, `got ${r.status}`);
const rotatedRefresh = r.data?.data?.refreshToken;

r = await req("/user/refresh", { method: "POST", body: { refreshToken: refreshA } });
check("reusing old refresh token → 401 (rotation/revocation)", r.status === 401, `got ${r.status}`);

// ---------- profile ----------
r = await req("/user/profile", { token: tokenA });
check("GET profile → 200 name/email", r.status === 200 && r.data?.data?.name === "Alice" && r.data?.data?.email === emailA, `got ${r.status}`);

r = await req("/user/profile", { method: "PATCH", token: tokenA, body: { name: "Alice Updated" } });
check("PATCH profile name → 200", r.status === 200 && r.data?.data?.name === "Alice Updated", `got ${r.status}`);

r = await req("/user/profile", { method: "PATCH", token: tokenA, body: { username: userB } });
check("PATCH profile to taken username → 409", r.status === 409, `got ${r.status}`);

// ---------- password change ----------
r = await req("/user/password", { method: "PUT", token: tokenA, body: { currentPassword: "nope", newPassword: "NewStr0ng!Pass" } });
check("wrong current password → 401", r.status === 401, `got ${r.status}`);

r = await req("/user/password", { method: "PUT", token: tokenA, body: { currentPassword: passA, newPassword: "NewStr0ng!Pass" } });
check("password change → 200 with fresh tokens", r.status === 200 && !!r.data?.data?.accessToken, `got ${r.status}`);
const pwRefresh = r.data?.data?.refreshToken;

r = await req("/user/login", { method: "POST", body: { emailOrUsername: emailA, password: passA } });
check("old password no longer works → 401", r.status === 401, `got ${r.status}`);

r = await req("/user/login", { method: "POST", body: { emailOrUsername: emailA, password: "NewStr0ng!Pass" } });
check("new password works → 200", r.status === 200, `got ${r.status}`);
const tokenA2 = r.data?.data?.accessToken;

// ---------- user-links list ----------
r = await req("/user-links", { token: tokenA2 });
const listed = r.data?.data?.links ?? [];
check("user-links → 200 with our links", r.status === 200 && listed.some((l) => l.shortCode === customCode), `got ${r.status}, n=${listed.length}`);
check("listed links include clickCount + derived shortUrl", listed.every((l) => typeof l.clickCount === "number" && typeof l.shortUrl === "string" && l.shortUrl.length > 0));
check("listed links carry QR + no hash", listed.every((l) => (l.qrCode || "").startsWith("data:image/") && !("passwordHash" in l)));

// ---------- delete ----------
r = await req(`/delete/${protectedCode}`, { method: "DELETE", token: tokenA2 });
check("owner delete → 200", r.status === 200, `got ${r.status}`);

r = await req(`/delete/${protectedCode}`, { method: "DELETE", token: tokenA2 });
check("second delete → 404", r.status === 404, `got ${r.status}`);

// ---------- expired link (410): set expiry in the past via SQL ----------
const { execSync } = await import("node:child_process");
execSync(
  `docker exec dotshort-postgres psql -U dotshort -d dotshort -c "UPDATE links SET expires_at = now() - interval '1 hour' WHERE short_code = '${customCode}';"`,
  { stdio: "ignore" }
);
r = await req(`/${customCode}`, { redirect: "manual" });
check("expired link → 410", r.status === 410, `got ${r.status}`);

// ---------- logout ----------
r = await req("/user/logout", { method: "POST", token: tokenA2 });
check("logout → 200", r.status === 200, `got ${r.status}`);

// Access JWTs are stateless (short-lived); revocation is enforced on the
// refresh token: after logout the session must not be refreshable.
r = await req("/user/refresh", { method: "POST", body: { refreshToken: pwRefresh } });
check("refresh token revoked by logout → 401", r.status === 401, `got ${r.status}`);

// ---------- rate limiting (last: may lock this IP briefly) ----------
let saw429 = false;
for (let i = 0; i < 14; i++) {
  const rr = await req("/validate-password", { method: "POST", body: { shortCode: `spam-${i}`, password: "x" } });
  if (rr.status === 429) {
    saw429 = true;
    break;
  }
}
check("validate-password rate limit kicks in (429)", saw429);

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db, links, clicks, type Link } from "../db/index.js";
import { parseOrThrow } from "../utils/validate.js";
import {
  shortenSchema,
  updateLinkSchema,
  validatePasswordSchema,
  shortCodeParamSchema,
} from "../validations/url.validation.js";
import { generateShortCode, RESERVED_SHORT_CODES } from "../utils/shortCode.js";
import { buildShortUrl } from "../utils/urls.js";
import {
  getTrend,
  getBreakdown,
  getReferrerBreakdown,
  getRecentClicks,
  getClickCount,
} from "../utils/analytics.js";
import { parseUserAgent, hashIp } from "../utils/userAgent.js";
import { isUniqueViolation } from "../utils/dbErrors.js";
import { eq, and, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import QRCode from "qrcode";
import type { Request, Response } from "express";

// Expired links are kept for a grace period so owners can still see/manage
// them; a daily sweep removes them afterwards (see index.ts).
const EXPIRED_LINK_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

const isExpired = (link: Pick<Link, "expiresAt">): boolean => {
  return Boolean(link.expiresAt && link.expiresAt < new Date());
};

/** Public JSON shape for a link: never leaks the password hash or owner id. */
const serializeLink = async (link: Link, req: Request) => {
  const shortUrl = buildShortUrl(req, link.shortCode);
  return {
    _id: link.id,
    longUrl: link.longUrl,
    shortCode: link.shortCode,
    shortUrl,
    qrCode: await QRCode.toDataURL(shortUrl),
    hasPassword: Boolean(link.passwordHash),
    expiresAt: link.expiresAt,
    clickCount: link.clickCount,
    createdAt: link.createdAt,
  };
};

/**
 * Record a click after the redirect has been sent: never add latency to the
 * redirect itself. Increments the counter and stores the event row in one
 * transaction; failures are logged, not user-visible.
 */
const recordClick = (link: Link, req: Request): void => {
  void (async () => {
    try {
      const { device, os, browser } = parseUserAgent(req.header("user-agent"));
      const referrer = (req.header("referer") ?? "").slice(0, 500) || null;
      const ipHash = hashIp(req.ip ?? req.socket.remoteAddress ?? undefined);

      await db.transaction(async (tx) => {
        await tx.insert(clicks).values({
          linkId: link.id,
          referrer,
          browser,
          os,
          device,
          ipHash,
        });
        await tx
          .update(links)
          .set({ clickCount: sql`${links.clickCount} + 1` })
          .where(eq(links.id, link.id));
      });
    } catch (error) {
      console.error("[click] failed to record:", error);
    }
  })();
};

/** Express params can be typed string | string[]: normalize to one string. */
const codeParam = (req: Request): string => {
  const raw = req.params.shortCode;
  return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
};

/** Load a link only if it belongs to the requester (404 otherwise). */
const findOwnedLink = async (shortCode: string, userId: string): Promise<Link> => {
  const [link] = await db
    .select()
    .from(links)
    .where(and(eq(links.shortCode, shortCode), eq(links.userId, userId)))
    .limit(1);

  if (!link) {
    throw new ApiError(404, "Link not found or you do not have permission to view it");
  }
  return link;
};

// Endpoint to shorten a URL
const shortenUrl = asyncHandler(async (req: Request, res: Response) => {
  const { longUrl, shortCode, password, expireInHours } = parseOrThrow(shortenSchema, req.body);

  const isCustomCode = Boolean(shortCode);
  if (isCustomCode && RESERVED_SHORT_CODES.has(shortCode!.toLowerCase())) {
    throw new ApiError(400, "This short code is reserved. Please choose another one.");
  }

  const expiresAt = expireInHours
    ? new Date(Date.now() + expireInHours * 60 * 60 * 1000)
    : null;
  const deleteAt = expiresAt ? new Date(expiresAt.getTime() + EXPIRED_LINK_GRACE_MS) : null;
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  // Insert with retry: the unique index on short_code is the arbiter, so two
  // concurrent requests can never claim the same code.
  let newLink: Link | null = null;
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS && !newLink; attempt++) {
    const code = isCustomCode ? shortCode! : generateShortCode();
    try {
      [newLink] = await db
        .insert(links)
        .values({
          longUrl,
          shortCode: code,
          passwordHash,
          expiresAt,
          deleteAt,
          userId: req.user?.id ?? null,
        })
        .returning();
    } catch (error) {
      if (isUniqueViolation(error)) {
        if (isCustomCode) {
          throw new ApiError(409, "Short code already in use");
        }
        continue; // auto-generated collision: retry with a fresh code
      }
      throw error;
    }
  }

  if (!newLink) {
    throw new ApiError(500, "Could not generate a unique short code. Please try again.");
  }

  const shortUrl = buildShortUrl(req, newLink.shortCode);
  const qrCode = await QRCode.toDataURL(shortUrl);

  const responseMessage = password
    ? "Password-protected URL created successfully"
    : isCustomCode
      ? "Custom URL created successfully"
      : "URL shortened successfully";

  res.status(201).json(
    new ApiResponse(201, responseMessage, {
      shortUrl,
      qrCode,
      expiresAt,
      shortCode: newLink.shortCode,
    })
  );
});

// Endpoint to redirect a short URL to the original URL
const redirectToLongUrl = asyncHandler(async (req: Request, res: Response) => {
  const shortCode = codeParam(req);

  // Malformed codes can never match a real link: reject before querying.
  if (!shortCodeParamSchema.safeParse(shortCode).success) {
    throw new ApiError(404, "URL not found");
  }

  const [link] = await db.select().from(links).where(eq(links.shortCode, shortCode)).limit(1);

  if (!link) {
    throw new ApiError(404, "URL not found");
  }

  if (isExpired(link)) {
    throw new ApiError(410, "This link has expired");
  }

  res.redirect(302, link.longUrl);
  recordClick(link, req);
});

const validatePasswordAndRedirect = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode, password } = parseOrThrow(validatePasswordSchema, req.body);

  const [link] = await db.select().from(links).where(eq(links.shortCode, shortCode)).limit(1);

  if (!link) {
    throw new ApiError(404, "URL not found");
  }

  // An expired protected link must not reveal its destination either.
  if (isExpired(link)) {
    throw new ApiError(410, "This link has expired");
  }

  if (!link.passwordHash) {
    throw new ApiError(400, "This URL is not password-protected");
  }

  const isMatch = await bcrypt.compare(password, link.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }

  res.json(
    new ApiResponse(200, "Password validated successfully", {
      longUrl: link.longUrl,
    })
  );
});

const getUserLinks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized: please log in to view your links");
  }

  const ownLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, req.user.id))
    .orderBy(desc(links.createdAt));

  const serialized = await Promise.all(ownLinks.map((link) => serializeLink(link, req)));

  res.status(200).json(new ApiResponse(200, "Shortened URLs fetched successfully", { links: serialized }));
});

// PATCH /links/:shortCode: update destination, password, expiration.
const updateLink = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const shortCode = codeParam(req);
  if (!shortCodeParamSchema.safeParse(shortCode).success) {
    throw new ApiError(404, "Link not found");
  }

  const updates = parseOrThrow(updateLinkSchema, req.body);
  const link = await findOwnedLink(shortCode, req.user.id);

  const patch: Partial<typeof links.$inferInsert> = {};

  if (updates.longUrl !== undefined) {
    patch.longUrl = updates.longUrl;
  }
  if (updates.password !== undefined) {
    patch.passwordHash = updates.password === null ? null : await bcrypt.hash(updates.password, 10);
  }
  if (updates.expireInHours !== undefined) {
    if (updates.expireInHours === null) {
      patch.expiresAt = null;
      patch.deleteAt = null;
    } else {
      const expiresAt = new Date(Date.now() + updates.expireInHours * 60 * 60 * 1000);
      patch.expiresAt = expiresAt;
      patch.deleteAt = new Date(expiresAt.getTime() + EXPIRED_LINK_GRACE_MS);
    }
  }

  const [updated] = await db
    .update(links)
    .set(patch)
    .where(eq(links.id, link.id))
    .returning();

  res
    .status(200)
    .json(new ApiResponse(200, "Link updated successfully", await serializeLink(updated, req)));
});

const deleteUrl = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const shortCode = codeParam(req);
  if (!shortCodeParamSchema.safeParse(shortCode).success) {
    throw new ApiError(404, "Link not found");
  }

  // Scoped to the requesting user: you can only delete your own links, and the
  // error message doesn't reveal whether someone else's link exists.
  // Click events cascade with the row.
  const deleted = await db
    .delete(links)
    .where(and(eq(links.shortCode, shortCode), eq(links.userId, req.user.id)))
    .returning({ id: links.id });

  if (deleted.length === 0) {
    throw new ApiError(404, "Link not found or you do not have permission to delete it");
  }

  res.json(new ApiResponse(200, "Link deleted successfully"));
});

// GET /overview: dashboard summary for the signed-in user.
const getOverview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const userId = req.user.id;
  const scope = { userId };

  const [totals, trend, recentRows, topRows] = await Promise.all([
    db
      .select({
        totalLinks: sql<number>`count(*)::int`,
        totalClicks: sql<number>`coalesce(sum(${links.clickCount}), 0)::int`,
      })
      .from(links)
      .where(eq(links.userId, userId)),
    getTrend(scope, 30),
    db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(desc(links.createdAt))
      .limit(5),
    db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(desc(links.clickCount))
      .limit(1),
  ]);

  const clicksLast7Days = await getClickCount(scope, 7);
  const recentLinks = await Promise.all(recentRows.map((link) => serializeLink(link, req)));

  res.status(200).json(
    new ApiResponse(200, "Overview fetched successfully", {
      totalLinks: totals[0]?.totalLinks ?? 0,
      totalClicks: totals[0]?.totalClicks ?? 0,
      clicksLast7Days,
      trend,
      recentLinks,
      topLink: topRows.length > 0 ? await serializeLink(topRows[0], req) : null,
    })
  );
});

// GET /links/:shortCode/analytics: per-link analytics (owner only).
const getLinkAnalytics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const shortCode = codeParam(req);
  if (!shortCodeParamSchema.safeParse(shortCode).success) {
    throw new ApiError(404, "Link not found");
  }

  const link = await findOwnedLink(shortCode, req.user.id);
  const scope = { linkId: link.id };

  const [trend, referrers, browsers, operatingSystems, devices, recent, clicksLast7Days] =
    await Promise.all([
      getTrend(scope, 30),
      getReferrerBreakdown(scope, 30),
      getBreakdown(scope, sql`${clicks.browser}`, 30),
      getBreakdown(scope, sql`${clicks.os}`, 30),
      getBreakdown(scope, sql`${clicks.device}`, 30),
      getRecentClicks(link.id, 20),
      getClickCount(scope, 7),
    ]);

  res.status(200).json(
    new ApiResponse(200, "Analytics fetched successfully", {
      link: await serializeLink(link, req),
      totalClicks: link.clickCount,
      clicksLast7Days,
      trend,
      referrers,
      browsers,
      operatingSystems,
      devices,
      recentClicks: recent,
    })
  );
});

// GET /analytics: account-wide analytics across all of the user's links.
const getAccountAnalytics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const scope = { userId: req.user.id };

  const [trend, referrers, browsers, operatingSystems, devices, clicksLast7Days, topRows] =
    await Promise.all([
      getTrend(scope, 30),
      getReferrerBreakdown(scope, 30),
      getBreakdown(scope, sql`${clicks.browser}`, 30),
      getBreakdown(scope, sql`${clicks.os}`, 30),
      getBreakdown(scope, sql`${clicks.device}`, 30),
      getClickCount(scope, 7),
      db
        .select()
        .from(links)
        .where(eq(links.userId, req.user.id))
        .orderBy(desc(links.clickCount))
        .limit(5),
    ]);

  const topLinks = await Promise.all(topRows.map((link) => serializeLink(link, req)));

  res.status(200).json(
    new ApiResponse(200, "Analytics fetched successfully", {
      trend,
      referrers,
      browsers,
      operatingSystems,
      devices,
      clicksLast7Days,
      topLinks,
    })
  );
});

export {
  shortenUrl,
  redirectToLongUrl,
  validatePasswordAndRedirect,
  getUserLinks,
  updateLink,
  deleteUrl,
  getOverview,
  getLinkAnalytics,
  getAccountAnalytics,
};

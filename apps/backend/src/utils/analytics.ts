import { sql, and, eq, gte, desc, type SQL } from "drizzle-orm";
import { db, clicks, links } from "../db/index.js";
import { normalizeReferrer } from "./userAgent.js";

export type ClickScope = { linkId: string } | { userId: string };

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const scopeConditions = (scope: ClickScope, days: number): SQL[] => {
  const conditions: SQL[] = [gte(clicks.clickedAt, daysAgo(days))];
  if ("linkId" in scope) {
    conditions.push(eq(clicks.linkId, scope.linkId));
  } else {
    conditions.push(eq(links.userId, scope.userId));
  }
  return conditions;
};

export interface TrendPoint {
  day: string;
  clicks: number;
}

/** Daily click counts for the last `days` days (YYYY-MM-DD buckets). */
export const getTrend = async (scope: ClickScope, days = 30): Promise<TrendPoint[]> => {
  return db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${clicks.clickedAt}), 'YYYY-MM-DD')`,
      clicks: sql<number>`count(*)::int`,
    })
    .from(clicks)
    .innerJoin(links, eq(clicks.linkId, links.id))
    .where(and(...scopeConditions(scope, days)))
    .groupBy(sql`1`)
    .orderBy(sql`1`);
};

export interface BreakdownEntry {
  value: string;
  count: number;
}

/** Value/count breakdown (browser, os, device, referrer) for a scope. */
export const getBreakdown = async (
  scope: ClickScope,
  field: SQL<string>,
  days = 30,
  limit = 7,
  fallbackValue = "Unknown"
): Promise<BreakdownEntry[]> => {
  const rows = await db
    .select({ value: field, count: sql<number>`count(*)::int` })
    .from(clicks)
    .innerJoin(links, eq(clicks.linkId, links.id))
    .where(and(...scopeConditions(scope, days)))
    .groupBy(field)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return rows.map((row) => ({
    value: row.value ?? fallbackValue,
    count: row.count,
  }));
};

/** Breakdown helper for the referrer column with hostname normalization. */
export const getReferrerBreakdown = async (
  scope: ClickScope,
  days = 30,
  limit = 7
): Promise<BreakdownEntry[]> => {
  // NULL referrer means a direct visit: label it "Direct", like the UI does.
  const rows = await getBreakdown(scope, sql<string>`${clicks.referrer}`, days, limit * 2, "Direct");
  const merged = new Map<string, number>();
  for (const row of rows) {
    const label = normalizeReferrer(row.value);
    merged.set(label, (merged.get(label) ?? 0) + row.count);
  }
  return [...merged.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export interface RecentClick {
  clickedAt: Date;
  referrer: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
}

export const getRecentClicks = async (linkId: string, limit = 20): Promise<RecentClick[]> => {
  return db
    .select({
      clickedAt: clicks.clickedAt,
      referrer: clicks.referrer,
      browser: clicks.browser,
      os: clicks.os,
      device: clicks.device,
    })
    .from(clicks)
    .where(eq(clicks.linkId, linkId))
    .orderBy(desc(clicks.clickedAt))
    .limit(limit);
};

/** Total clicks for a scope within a window (from the raw event table). */
export const getClickCount = async (scope: ClickScope, days?: number): Promise<number> => {
  const conditions =
    days !== undefined
      ? scopeConditions(scope, days)
      : "linkId" in scope
        ? [eq(clicks.linkId, scope.linkId)]
        : [eq(links.userId, scope.userId)];

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clicks)
    .innerJoin(links, eq(clicks.linkId, links.id))
    .where(and(...conditions));

  return row?.count ?? 0;
};

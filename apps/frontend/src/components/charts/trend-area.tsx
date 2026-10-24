"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/redux/api";
import { RouteMark } from "@/components/brand/route-mark";

const ACCENT = "#1f8a63";

interface TrendTooltipProps {
  active?: boolean;
  payload?: { payload: { day: string; clicks: number } }[];
}

function TrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{point.day}</p>
      <p className="mt-0.5 font-medium tabular">
        {point.clicks} click{point.clicks === 1 ? "" : "s"}
      </p>
    </div>
  );
}

const shortDay = (day: string): string => {
  // "2026-10-23" → "Oct 23"
  const date = new Date(`${day}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? day
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/** Add zero-click days so a sparse result still reads as a thirty-day timeline. */
function withEmptyDays(data: TrendPoint[], days = 30): TrendPoint[] {
  const counts = new Map(data.map((point) => [point.day, point.clicks]));
  const today = new Date();
  const points: TrendPoint[] = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset)
    );
    const day = date.toISOString().slice(0, 10);
    points.push({ day, clicks: counts.get(day) ?? 0 });
  }

  return points;
}

/** 30-day clicks-over-time area chart; neutral axes work in both themes. */
export function TrendArea({ data, height = 260 }: { data: TrendPoint[]; height?: number }) {
  if (data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-sm text-muted-foreground"
        style={{ height }}
      >
        <RouteMark className="h-8 w-8 text-primary" />
        No clicks in the last 30 days yet
      </div>
    );
  }

  const chartData = withEmptyDays(data);
  const lastPoint = chartData[chartData.length - 1];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.16} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#94a3b81f" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={shortDay}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#94a3b833" }}
            minTickGap={28}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#94a3b855" }} />
          <Area
            type="monotone"
            dataKey="clicks"
            name="Clicks"
            stroke={ACCENT}
            strokeWidth={2}
            strokeLinecap="round"
            fill="url(#clicksFill)"
            activeDot={{ r: 4, strokeWidth: 2, fill: "#e8621d" }}
          />
          <ReferenceDot
            x={lastPoint.day}
            y={lastPoint.clicks}
            r={3.5}
            fill="#e8621d"
            stroke="#fff"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { getCacheTTL } from "@/lib/helpers/cacheTTL";
import { PLAN_LIMITS } from "@/lib/config/planLimits";
import { Plan } from "@/lib/config/plans";

const rangeMap = { "1D": 1, "1W": 7, "1M": 30, "1Y": 365 };
const paginationWindowMap = { "1D": 7, "1W": 30, "1M": 90, "1Y": 730 };

function getBucketKey(ts: number, range: string): string {
  const date = new Date(ts);
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const h = date.getHours();

  switch (range) {
    case "1D": return `${y}-${m}-${d}-${h}`;
    case "1W": return `${y}-${m}-${d}-${Math.floor(h / 4)}`;
    case "1M": return `${y}-${m}-${d}`;
    case "1Y": {
      const week = Math.floor(
        (ts - new Date(y, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      return `${y}-W${week}`;
    }
    default: return `${y}-${m}-${d}`;
  }
}

function toCandles(prices: [number, number][], range: string) {
  const buckets = new Map<string, { ts: number; prices: number[] }>();
  for (const [ts, price] of prices) {
    const key = getBucketKey(ts, range);
    if (!buckets.has(key)) buckets.set(key, { ts, prices: [] });
    buckets.get(key)!.prices.push(price);
  }
  return Array.from(buckets.values()).map(({ ts, prices }) => ({
    date: ts,
    open: prices[0],
    high: Math.max(...prices),
    low: Math.min(...prices),
    close: prices[prices.length - 1],
    volume: 0,
  }));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("preferred_currency, package_type")
    .eq("id", user.id)
    .single();

  const currency = (profile?.preferred_currency ?? "USD").toLowerCase();
  const plan = profile?.package_type as Plan;
  const CACHE_TTL = getCacheTTL("market", plan);

  const range = (req.nextUrl.searchParams.get("range") ?? "1M") as keyof typeof rangeMap;
  const beforeParam = req.nextUrl.searchParams.get("before");
  const CACHE_KEY = `chart:${id}:${currency}:${range}${beforeParam ? `:${beforeParam}` : ""}`;

  // 1. check cache first — cache hits are free, don't count against limit
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      console.log(`✅ Chart cache hit: ${CACHE_KEY}`);
      return Response.json(JSON.parse(cached));
    }
  } catch (err) {
    console.error("⚠️ Redis GET error:", err);
  }

  // 2. cache miss — check daily limit before hitting CoinGecko
  const limit = PLAN_LIMITS[plan]?.chart_views_per_day;
  if (limit !== null) {
    const { data: usage } = await supabaseAdmin
      .from("usage")
      .select("chart_views_today, last_chart_view_reset")
      .eq("user_id", user.id)
      .single();

    const lastReset = usage?.last_chart_view_reset
      ? new Date(usage.last_chart_view_reset)
      : null;
    const today = new Date();
    const isNewDay = !lastReset || lastReset.toDateString() !== today.toDateString();
    const currentViews = isNewDay ? 0 : (usage?.chart_views_today ?? 0);

    if (currentViews >= limit) {
      return Response.json(
        { error: "Daily chart view limit reached, upgrade your plan" },
        { status: 403 }
      );
    }

    // increment usage
    await supabaseAdmin.from("usage").upsert(
      {
        user_id: user.id,
        chart_views_today: currentViews + 1,
        last_chart_view_reset: isNewDay ? today.toISOString() : usage?.last_chart_view_reset,
      },
      { onConflict: "user_id" }
    );
  }

  // 3. fetch from CoinGecko
  const toTs = beforeParam ? Number(beforeParam) : Date.now();
  const windowMs = rangeMap[range] * 24 * 60 * 60 * 1000;
  const fromTs = toTs - windowMs;
  const fetchDays = paginationWindowMap[range];

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${fetchDays}&precision=full`,
  );

  if (res.status === 429) return Response.json({ error: "RATE_LIMITED" }, { status: 429 });
  if (res.status === 401 || res.status === 403) return Response.json({ error: "PROVIDER_AUTH_ERROR" }, { status: 502 });
  if (!res.ok) {
    console.error(`CoinGecko error: ${res.status}`, await res.text());
    return Response.json({ error: "Failed to fetch market data" }, { status: 502 });
  }

  const raw = await res.json();
  const allPrices: [number, number][] = raw.prices ?? [];
  const sliced = allPrices.filter(([ts]) => ts >= fromTs && ts <= toTs);
  const candles = toCandles(sliced, range);
  const oldestTs = sliced[0]?.[0] ?? null;
  const hasMore = allPrices.some(([ts]) => ts < fromTs);

  const response = { candles, pagination: { oldestTs, hasMore } };

  // 4. cache the result
  try {
    await redis.set(CACHE_KEY, JSON.stringify(response), "EX", CACHE_TTL);
    console.log(`📦 Cached chart data: ${CACHE_KEY} (TTL: ${CACHE_TTL}s)`);
  } catch (err) {
    console.error("⚠️ Redis SET error:", err);
  }

  return Response.json(response);
}
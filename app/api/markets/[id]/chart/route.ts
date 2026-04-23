import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

const rangeMap = { "1D": 1, "1W": 7, "1M": 30, "1Y": 365 };
const paginationWindowMap = { "1D": 7, "1W": 30, "1M": 90, "1Y": 730 };

function getBucketKey(ts: number, range: string): string {
  const date = new Date(ts);
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const h = date.getHours();

  switch (range) {
    case "1D":
      return `${y}-${m}-${d}-${h}`;
    case "1W": {
      const fourHourBucket = Math.floor(h / 4);
      return `${y}-${m}-${d}-${fourHourBucket}`;
    }
    case "1M":
      return `${y}-${m}-${d}`;
    case "1Y": {
      const startOfYear = new Date(y, 0, 1);
      const week = Math.floor(
        (ts - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      return `${y}-W${week}`;
    }
    default:
      return `${y}-${m}-${d}`;
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const range = (req.nextUrl.searchParams.get("range") ??
    "1M") as keyof typeof rangeMap;
  const beforeParam = req.nextUrl.searchParams.get("before");

  // Keep timestamps in ms throughout
  const toTs = beforeParam ? Number(beforeParam) : Date.now();
  const windowMs = rangeMap[range] * 24 * 60 * 60 * 1000;
  const fromTs = toTs - windowMs;

  
  const fetchDays = paginationWindowMap[range];

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${fetchDays}&precision=full`,
  );

  if (res.status === 429) {
    return Response.json({ error: "RATE_LIMITED" }, { status: 429 });
  }
  if (res.status === 401 || res.status === 403) {
  return Response.json({ error: "PROVIDER_AUTH_ERROR" }, { status: 502 }); // your key issue, not user's
}
  if (!res.ok) {
    console.error(`CoinGecko error: ${res.status}`, await res.text());
    return Response.json(
      { error: "Failed to fetch market data" },
      { status: 502 },
    );
  }

  const raw = await res.json();
  const allPrices: [number, number][] = raw.prices ?? [];

  // Slice to only the requested time window
  const sliced = allPrices.filter(([ts]) => ts >= fromTs && ts <= toTs);
  const candles = toCandles(sliced, range);

  const oldestTs = sliced[0]?.[0] ?? null;
  // hasMore = there's data in the full fetch that's older than our window
  const hasMore = allPrices.some(([ts]) => ts < fromTs);

  return Response.json({
    candles,
    pagination: {
      oldestTs,
      hasMore,
    },
  });
}

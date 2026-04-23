import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { createClient } from "@/utils/supabase/server";

const CACHE_TTL = 120;

interface FearGreedResponse {
  data: {
    value: string;
    value_classification: string;
  }[];
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const CACHE_KEY = `watchlist:stats:${user.id}`;
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    console.log("Watchlist stats cache hit");
    return NextResponse.json(JSON.parse(cached));
  }

  // run all queries in parallel
  const [fearGreedRes, { data: holdings }, { data: watchlist }] =
    await Promise.all([
      fetch("https://api.alternative.me/fng/", {
        next: { revalidate: 3600 },
      }),
      supabase
        .from("holdings")
        .select("coin_id, amount")
        .eq("user_id", user.id),
      supabase
        .from("watchlist")
        .select("coin_id")
        .eq("user_id", user.id),
    ]);

  if (!fearGreedRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch fear & greed index" },
      { status: 500 }
    );
  }

  const fearGreedJson: FearGreedResponse = await fearGreedRes.json();
  const raw = fearGreedJson.data[0];

  // get live prices for holdings coins from redis cache
  // (already cached by watchlist route)
  const holdingsCoins = holdings ?? [];
  let totalValue = 0;
  let totalChange = 0;
  let topPerformer = { symbol: "N/A", changePercent: 0 };

  if (holdingsCoins.length > 0) {
    const coinIds = holdingsCoins.map((h) => h.coin_id).join(",");
    const marketsCacheKey = `watchlist:${user.id}:page:1`;
    const cachedMarkets = await redis.get(marketsCacheKey);

    if (cachedMarkets) {
      const markets = JSON.parse(cachedMarkets);
      const marketMap = Object.fromEntries(
        markets.map((m: { id: string; current_price: number; price_change_percentage_24h: number; symbol: string }) => [m.id, m])
      );

      for (const holding of holdingsCoins) {
        const market = marketMap[holding.coin_id];
        if (!market) continue;

        const value = holding.amount * market.current_price;
        const change = holding.amount * market.current_price * (market.price_change_percentage_24h / 100);
        totalValue += value;
        totalChange += change;

        if (market.price_change_percentage_24h > topPerformer.changePercent) {
          topPerformer = {
            symbol: market.symbol.toUpperCase(),
            changePercent: Number(market.price_change_percentage_24h.toFixed(2)),
          };
        }
      }
    }
  }

  const totalChangePercent =
    totalValue > 0
      ? Number(((totalChange / totalValue) * 100).toFixed(2))
      : 0;

  const result = {
    totalValue,
    totalChangePercent,
    topPerformer,
    marketSentiment: {
      label: raw.value_classification,
      score: Number(raw.value),
    },
  };

  await redis.set(CACHE_KEY, JSON.stringify(result), "EX", CACHE_TTL);
  console.log("Watchlist stats fetched and cached");

  return NextResponse.json(result);
}
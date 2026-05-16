import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redis } from "@/lib/redis";
import { MarketCoin } from "@/types";
import { applyRateLimit } from "@/lib/helpers/applyRateLimit";
import { getCacheTTL } from "@/lib/helpers/cacheTTL";


interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
}



export async function GET(req: Request) {
  try {
    // rate limit check
  const { success } = await applyRateLimit(req);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_currency, package_type")
      .eq("id", user.id)
      .single();

    const currency = (profile?.preferred_currency ?? "USD").toLowerCase();

    const CACHE_TTL = getCacheTTL("alerts", profile?.package_type);
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : undefined;

    let query = supabase
      .from("alerts")
      .select(
        "id, coin_id, condition, target_price, created_at, triggered_recently, last_price, status, in_app, email, email_address",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!alerts?.length) return NextResponse.json([]);

    const CACHE_KEY = `alert:coins:${user.id}`;

    let cached = null;
    try {
      cached = await redis.get(CACHE_KEY);
    } catch (redisErr) {
      console.error("❌ Redis error:", redisErr);
    }

    let marketMap: Map<string, MarketCoin>;

    if (cached) {
      const markets: MarketCoin[] = JSON.parse(cached);
      marketMap = new Map(markets.map((c) => [c.id, c]));
    } else {
      const ids = [...new Set(alerts.map((a) => a.coin_id))].join(",");

      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${ids}&order=market_cap_desc&sparkline=false`,
        { headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY! } },
      );

      if (!res.ok) {
        return NextResponse.json(
          alerts.map((a) => ({
            ...a,
            coin_name: a.coin_id,
            coin_symbol: "",
            coin_image: "",
            current_price: null,
          })),
        );
      }

      const data: CoinGeckoResponse[] = await res.json();

      const markets: MarketCoin[] = data.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_7d: coin.price_change_percentage_7d_in_currency,
        market_cap: coin.market_cap,
        sparkline: [],
        isWatchlisted: false,
        hasAlert: true,
      }));

      try {
        await redis.set(CACHE_KEY, JSON.stringify(markets), "EX", CACHE_TTL);
      } catch (redisErr) {
        console.error("⚠️  Redis SET error:", redisErr);
      }
      marketMap = new Map(markets.map((c) => [c.id, c]));
    }

    const enriched = alerts.map((alert) => {
      const coin = marketMap.get(alert.coin_id);
      return {
        ...alert,
        coin_name: coin?.name ?? alert.coin_id,
        coin_symbol: coin?.symbol ?? "",
        coin_image: coin?.image ?? "",
        current_price: coin?.current_price ?? null,
      };
    });
    return NextResponse.json(enriched);
  } catch (err) {
    console.error("❌ Unhandled error in /api/alerts:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

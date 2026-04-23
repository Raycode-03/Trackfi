import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { MarketCoin } from "@/types";
import { createClient } from "@/utils/supabase/server";

const CACHE_KEY = "watchlist:list";
const CACHE_TTL = 300;

interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  let markets: MarketCoin[];
  const cached = await redis.get(CACHE_KEY);
  if (cached) { console.log("Cache hit")
    markets = JSON.parse(cached);
  } else {
     console.log("Cache missed")
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h,7d",
      {
        headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY! },
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch markets" },
        { status: 500 },
      );
    }

    const data: CoinGeckoResponse[] = await res.json();
    
    markets = data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      price_change_percentage_7d: coin.price_change_percentage_7d_in_currency,
      market_cap: coin.market_cap,
      sparkline: coin.sparkline_in_7d?.price ?? [],
      isWatchlisted: false,
      hasAlert: false,
    }));
    
    const result = await redis.set(CACHE_KEY, JSON.stringify(markets), "EX", CACHE_TTL);
    console.log("Fetched market list from CoinGecko and cached in Redis");
    console.log("Redis set result:", result)
  }
   const [{ data: watchlist }, { data: alerts }] = await Promise.all([
    supabase.from("watchlist").select("coin_id, holdings").eq("user_id", user.id),
    supabase.from("alerts").select("coin_id").eq("user_id", user.id),
  ]);

  const watchlistIds = new Set(watchlist?.map((i) => i.coin_id) ?? []);
  const alertIds = new Set(alerts?.map((i) => i.coin_id) ?? []);

  const result = markets.map((coin) => ({
    ...coin,
    isWatchlisted: watchlistIds.has(coin.id),
    
    hasAlert: alertIds.has(coin.id),
  }));
  return NextResponse.json(result);
}

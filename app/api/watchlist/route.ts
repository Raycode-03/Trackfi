import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { MarketCoin } from "@/types";
import { createClient } from "@/utils/supabase/server";

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

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const [{ data: watchlist }, { data: alerts }, { data: holdings }] =
    await Promise.all([
      supabase
        .from("watchlist")
        .select("coin_id, coin_name, coin_symbol, coin_image")
        .eq("user_id", user.id)
        .range(offset, offset + limit - 1),  // paginate watchlist from DB
      supabase.from("alerts").select("coin_id").eq("user_id", user.id),
      supabase.from("holdings").select("coin_id, amount").eq("user_id", user.id),
    ]);

  // get total count separately for pagination
  const { count: totalCount } = await supabase
    .from("watchlist")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!watchlist || watchlist.length === 0) {
    return NextResponse.json({ coins: [], total: 0, page, limit });
  }

  const watchlistIds = new Set(watchlist.map((i) => i.coin_id));
  const holdingIds = new Set(holdings?.map((i) => i.coin_id) ?? []);
  const allCoinIds = [...new Set([...watchlistIds, ...holdingIds])];
  const ids = allCoinIds.join(",");
  const CACHE_KEY = `watchlist:${user.id}:page:${page}`;

  let markets: MarketCoin[];
  const cached = await redis.get(CACHE_KEY);

  if (cached) {
    console.log("Cache hit");
    markets = JSON.parse(cached);
  } else {
    console.log("Cache missed");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`,
      { headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY! } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
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
      isWatchlisted: true,
      hasAlert: false,
    }));

    await redis.set(CACHE_KEY, JSON.stringify(markets), "EX", CACHE_TTL);
  }

  const alertIds = new Set(alerts?.map((i) => i.coin_id) ?? []);
  const holdingsMap = Object.fromEntries(
    (holdings ?? []).map((i) => [i.coin_id, i.amount])
  );

  const result = markets.map((coin) => {
    const holdingAmount = holdingsMap[coin.id] ?? null;
    const holdingsValue = holdingAmount ? holdingAmount * coin.current_price : null;
    const holdingsValueChange24h =
      holdingAmount && coin.price_change_percentage_24h
        ? holdingAmount * coin.current_price * (coin.price_change_percentage_24h / 100)
        : null;

    return {
      ...coin,
      isWatchlisted: watchlistIds.has(coin.id),
      hasAlert: alertIds.has(coin.id),
      holdings: holdingAmount,
      holdingsValue,
      holdingsValueChange24h,
    };
  });

  return NextResponse.json({
    coins: result,
    total: totalCount ?? 0,
    page,
    limit,
  });
}
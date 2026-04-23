import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { MarketCoin } from "@/types";
import { createClient } from "@/utils/supabase/server";

const CACHE_TTL = 300;
const PAGE_SIZE = 20;
const CG_PAGE_SIZE = 100;

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
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const cgPage = Math.ceil(page / (CG_PAGE_SIZE / PAGE_SIZE));
  const CACHE_KEY = `markets:list:${cgPage}`;

  let markets: MarketCoin[];
  const cached = await redis.get(CACHE_KEY);

  if (cached) {
    console.log(`Cache hit for CG page ${cgPage}`);
    markets = JSON.parse(cached);
  } else {
    console.log(`Cache missed for CG page ${cgPage}`);
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${CG_PAGE_SIZE}&page=${cgPage}&sparkline=true&price_change_percentage=24h,7d`,
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
      isWatchlisted: false,
      hasAlert: false,
    }));

    await redis.set(CACHE_KEY, JSON.stringify(markets), "EX", CACHE_TTL);
    console.log(`Fetched CG page ${cgPage} and cached`);
  }

  
  const [{ data: watchlist }, { data: alerts }] = await Promise.all([
    supabase.from("watchlist").select("coin_id").eq("user_id", user.id),
    supabase.from("alerts").select("coin_id").eq("user_id", user.id),
  ]);

  const watchlistIds = new Set(watchlist?.map((i) => i.coin_id) ?? []);
  const alertIds = new Set(alerts?.map((i) => i.coin_id) ?? []);

  
  const filtered = markets
    .map((coin) => ({
      ...coin,
      isWatchlisted: watchlistIds.has(coin.id),
      hasAlert: alertIds.has(coin.id),
    }))
    .filter((coin) =>
      search
        ? coin.name.toLowerCase().includes(search) ||
          coin.symbol.toLowerCase().includes(search)
        : true
    );

  
  const withinBatchOffset = offset % CG_PAGE_SIZE;

  return NextResponse.json({
    coins: filtered.slice(withinBatchOffset, withinBatchOffset + PAGE_SIZE),
    total: filtered.length + (cgPage * CG_PAGE_SIZE), // approximate total
    page,
    limit: PAGE_SIZE,
    cgPage,
  });
}
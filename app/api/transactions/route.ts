import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redis } from "@/lib/redis";
import { applyRateLimit } from "@/lib/helpers/applyRateLimit";
import { getCacheTTL } from "@/lib/helpers/cacheTTL";

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

export async function GET(req: Request) {
  try {
      // rate limit check
  const { success } = await applyRateLimit(req);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_currency , package_type")
      .eq("id", user.id)
      .single();

    const currency = (profile?.preferred_currency ?? "USD").toLowerCase();
    const CACHE_TTL = getCacheTTL('transactions', profile?.package_type);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "30";
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (period !== "all") {
      const from = new Date();
      from.setDate(from.getDate() - Number(period));
      query = query.gte("date", from.toISOString());
    }

    const { data: transactions, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ transactions: [], total: 0, page, limit });
    }

    const uniqueCoinIds = [...new Set(transactions.map((t) => t.coin_id))];
    const ids = uniqueCoinIds.join(",");
    const CACHE_KEY = `transaction:markets:${ids}`;

    let markets: CoinGeckoMarket[] = [];

    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        console.log("Cache hit");
        markets = JSON.parse(cached);
      }
    } catch {
      console.error("⚠️ Redis GET error");
    }

    if (markets.length === 0) {
      console.log("Cache missed");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${ids}&order=market_cap_desc&sparkline=false`,
        { headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY! } },
      );

      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
      }

      markets = await res.json();

      try {
        await redis.set(CACHE_KEY, JSON.stringify(markets), "EX", CACHE_TTL);
      } catch {
        console.error("⚠️ Redis SET error");
      }
    }

    const marketMap = Object.fromEntries(markets.map((m) => [m.id, m]));

    const result = transactions.map((tx) => {
      const market = marketMap[tx.coin_id];
      const currentValue = market ? tx.amount * market.current_price : null;
      const unrealizedPnl = market
        ? market.current_price * tx.amount - tx.total_value
        : null;

      return {
        ...tx,
        coin_name: market?.name ?? tx.symbol,
        coin_image: market?.image ?? null,
        current_price: market?.current_price ?? null,
        current_value: currentValue,
        unrealized_pnl: unrealizedPnl,
      };
    });

    return NextResponse.json({ transactions: result, total: count ?? 0, page, limit });
  } catch (err) {
    console.error("❌ Unhandled error in /api/transactions:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
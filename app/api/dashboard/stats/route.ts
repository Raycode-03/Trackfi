import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redis } from "@/lib/redis";

const CACHE_TTL = 60;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_currency")
      .eq("id", user.id)
      .single();

    const currency = (profile?.preferred_currency ?? "USD").toLowerCase();

    const [{ data: alerts }, { data: transactions }, { data: holdings }] =
      await Promise.all([
        supabase
          .from("alerts")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "active"),
        supabase
          .from("transactions")
          .select("coin_id, symbol, type, amount, price, total_value, date")
          .eq("user_id", user.id)
          .eq("status", "completed"),
        supabase
          .from("holdings")
          .select("coin_id, amount")
          .eq("user_id", user.id),
      ]);

    const txs = transactions ?? [];
    const coinIds = (holdings ?? []).map((h) => h.coin_id);

    let priceMap: Record<string, number> = {};

    if (coinIds.length > 0) {
      const cacheKey = `dashboard:prices:${coinIds.sort().join(",")}`;

      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          priceMap = JSON.parse(cached as string);
        }
      } catch (redisErr) {
        console.error("⚠️  Redis GET error:", redisErr);
      }
      if (Object.keys(priceMap).length === 0) {
        const ids = coinIds.join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${ids}&order=market_cap_desc&sparkline=false`,
          { headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY! } },
        );

        if (res.ok) {
          const coins = await res.json();
          for (const coin of coins) {
            priceMap[coin.id] = coin.current_price;
          }

          try {
            await redis.set(
              cacheKey,
              JSON.stringify(priceMap),
              "EX",
              CACHE_TTL,
            );
          } catch (redisErr) {
            console.error("⚠️  Redis SET error:", redisErr);
          }
        }
      }
    }

    const holdingsMap: Record<string, number> = {};
    for (const h of holdings ?? []) {
      holdingsMap[h.coin_id] = Number(h.amount);
    }

    let totalValue = 0;
    for (const [coinId, amount] of Object.entries(holdingsMap)) {
      const livePrice = priceMap[coinId] ?? 0;
      totalValue += amount * livePrice;
    }

    const coinMeta: Record<string, { symbol: string; spent: number }> = {};
    for (const tx of txs) {
      if (!coinMeta[tx.coin_id])
        coinMeta[tx.coin_id] = { symbol: tx.symbol, spent: 0 };
      if (tx.type === "buy" || tx.type === "deposit")
        coinMeta[tx.coin_id].spent += Number(tx.total_value);
      if (tx.type === "sell" || tx.type === "withdrawal")
        coinMeta[tx.coin_id].spent -= Number(tx.total_value);
    }
    const totalSpent = Object.values(coinMeta).reduce(
      (sum, c) => sum + c.spent,
      0,
    );

    const netPnL = totalValue - totalSpent;
    const pnlPercent =
      totalSpent > 0 ? ((netPnL / totalSpent) * 100).toFixed(2) : 0;

    let bestPerformer = null;
    for (const [coinId, amount] of Object.entries(holdingsMap)) {
      if (amount <= 0) continue;
      const livePrice = priceMap[coinId] ?? 0;
      const spent = coinMeta[coinId]?.spent ?? 0;
      const avgBuy = spent / amount;
      const percent =
        avgBuy > 0 ? (((livePrice - avgBuy) / avgBuy) * 100).toFixed(2) : 0;

      if (!bestPerformer || Number(percent) > Number(bestPerformer.percent)) {
        bestPerformer = { symbol: coinMeta[coinId]?.symbol ?? coinId, percent };
      }
    }

    const chartMap: Record<string, number> = {};
    for (const tx of txs) {
      const date = new Date(tx.date).toISOString().split("T")[0];
      const delta =
        tx.type === "buy" || tx.type === "deposit"
          ? Number(tx.total_value)
          : tx.type === "sell" || tx.type === "withdrawal"
            ? -Number(tx.total_value)
            : 0;
      chartMap[date] = (chartMap[date] ?? 0) + delta;
    }

    let running = 0;
    const chartData = Object.entries(chartMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => {
        running += value;
        return { date, value: running };
      });

    return NextResponse.json({
      totalValue,
      netPnL,
      pnlPercent,
      bestPerformer,
      activeAlerts: alerts?.length ?? 0,
      chartData,
    });
  } catch (err) {
    console.error("❌ Error in GET /api/dashboard/stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}

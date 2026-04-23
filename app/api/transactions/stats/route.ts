  import { NextResponse } from "next/server";
  import { createClient } from "@/utils/supabase/server";
  import { redis } from "@/lib/redis";

  const CACHE_TTL = 120;

  export async function GET(req: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "30";
    const CACHE_KEY = `transaction:stats:${user.id}:${period}`;

    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      console.log("Stats cache hit");
      return NextResponse.json(JSON.parse(cached));
      }

    
    const fromDate = period !== "all"
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() - Number(period));
          return d.toISOString();
        })()
      : null;

    
    const [
      { count: total },
      { count: buyOrders, data: buyData },
      { count: sellOrders, data: sellData },
      { count: lifetimeTotal },
    ] = await Promise.all([
      
      supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("date", fromDate ?? "1970-01-01"),

      
      supabase
        .from("transactions")
        .select("total_value", { count: "exact" })
        .eq("user_id", user.id)
        .eq("type", "buy")
        .gte("date", fromDate ?? "1970-01-01"),

      
      supabase
        .from("transactions")
        .select("total_value", { count: "exact" })
        .eq("user_id", user.id)
        .eq("type", "sell")
        .gte("date", fromDate ?? "1970-01-01"),

      
      supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    const totalVolumeBought = (buyData ?? []).reduce(
      (sum, t) => sum + (t.total_value ?? 0), 0
    );
    const totalVolumeSold = (sellData ?? []).reduce(
      (sum, t) => sum + (t.total_value ?? 0), 0
    );
    const result = {
      total: lifetimeTotal ?? 0,       
      filtered: total ?? 0,            
      totalVolumeBought,
      totalVolumeSold,
      buyOrders: buyOrders ?? 0,
      sellOrders: sellOrders ?? 0,
      boughtChange: 0,                    
      soldChange: 0,
      networkStatus: "Operational",
    };

    await redis.set(CACHE_KEY, JSON.stringify(result), "EX", CACHE_TTL);

    return NextResponse.json(result);
  }
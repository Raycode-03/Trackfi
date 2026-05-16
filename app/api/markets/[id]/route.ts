import { createClient } from "@/utils/supabase/server";
import { NextRequest , NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/helpers/applyRateLimit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
    // rate limit check
  const { success } = await applyRateLimit(req);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_currency")
    .eq("id", user.id)
    .single();

  const currency = (profile?.preferred_currency ?? "USD").toLowerCase();

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}?localization=false&sparkline=false`,
  );
  const raw = await res.json();

  const coin = {
    id: raw.id,
    name: raw.name,
    symbol: raw.symbol?.toUpperCase(),
    image: raw.image?.large,
    description: raw.description?.en ?? "",

    current_price: raw.market_data?.current_price?.[currency],
    market_cap: raw.market_data?.market_cap?.[currency],
    total_volume: raw.market_data?.total_volume?.[currency],

    price_change_percentage_24h: raw.market_data?.price_change_percentage_24h,
    price_change_percentage_7d: raw.market_data?.price_change_percentage_7d,

    ath: raw.market_data?.ath?.[currency],
    ath_change_percentage: raw.market_data?.ath_change_percentage?.[currency],

    circulating_supply: raw.market_data?.circulating_supply,
    max_supply: raw.market_data?.max_supply,
  };
  return Response.json(coin);
}

import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    current_price: raw.market_data?.current_price?.usd,
    market_cap: raw.market_data?.market_cap?.usd,
    total_volume: raw.market_data?.total_volume?.usd,

    price_change_percentage_24h: raw.market_data?.price_change_percentage_24h,
    price_change_percentage_7d: raw.market_data?.price_change_percentage_7d,

    ath: raw.market_data?.ath?.usd,
    ath_change_percentage: raw.market_data?.ath_change_percentage?.usd,

    circulating_supply: raw.market_data?.circulating_supply,
    max_supply: raw.market_data?.max_supply,
  };
  return Response.json(coin);
}

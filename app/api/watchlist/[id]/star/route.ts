import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { PLAN_LIMITS } from "@/lib/config/planLimits";
import { Plan } from "@/lib/config/plans";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: coinId } = await params;
  const { starred, coinName, coinSymbol, coinImage } = await request.json();
  const supabase = supabaseAdmin;
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("package_type")
    .eq("id", user.id)
    .single();
  if (profile === null)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: watchlist } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", user.id);

  const plan = profile.package_type as Plan;
  
  if (starred === true) {
    const limit = PLAN_LIMITS[plan].watchlist_items;
    if (limit !== null && (watchlist?.length ?? 0) >= limit) {
      return NextResponse.json(
        { error: "Can't add more coins, limit reached, upgrade your plan" },
        { status: 403 },
      );
    }
    const { error } = await supabase.from("watchlist").insert({
      user_id: user.id,
      coin_id: coinId,
      coin_name: coinName,
      coin_symbol: coinSymbol,
      coin_image: coinImage,
    });
    if (error) {
      console.error("Error adding to watchlist:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  if (starred === false) {
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("coin_id", coinId);
    if (error) {
      console.error("Error removing from watchlist:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ success: true }, { status: 200 });
}

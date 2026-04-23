import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
export async function POST(
  request: Request,
  { params }:{ params: Promise<{ id: string }> },
) {
  const { id:coinId } = await params;
  const { starred, coinName, coinSymbol, coinImage } = await request.json();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (starred === true) {
    const { error } = await supabase
      .from("watchlist")
      .insert({
        user_id: user.id,
        coin_id: coinId,
        coin_name: coinName,
        coin_symbol: coinSymbol,
        coin_image: coinImage,
      })
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

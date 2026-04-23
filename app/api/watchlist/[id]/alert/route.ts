import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { alertCreateSchema } from "@/lib/validations/alert_validation";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id:coinId } = await params;
  const body = await request.json()
  const parsed = alertCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const { type , value } = parsed.data;
    
  const supabase = await createClient();
  const { data: { user }, } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (type && value ) {
    const { error } = await supabase
      .from("alerts")
      .upsert({
        user_id: user.id,
        coin_id: coinId,
        value,
        type,
        }, { onConflict: "user_id,coin_id" })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  if (!value && !type) {
    const { error } = await supabase
      .from("alerts")
      .delete()
      .eq("user_id", user.id)
      .eq("coin_id", coinId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ success: true }, { status: 200 });
}

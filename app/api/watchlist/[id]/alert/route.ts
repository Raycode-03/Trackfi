import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { alertCreateSchema } from "@/lib/validations/alert_validation";
import { createClient } from "@/utils/supabase/server";
import { PLAN_LIMITS } from "@/lib/config/planLimits";
import { Plan } from "@/lib/config/plans";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: coinId } = await params;
  const body = await request.json();
  const parsed = alertCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 },
    );
  }

  const { type, value } = parsed.data;

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
  if (profile === null) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active");

  const plan = profile.package_type as Plan;
  const limit = PLAN_LIMITS[plan].active_alerts;

  if (limit !== null && (alerts?.length ?? 0) >= limit) {
    return NextResponse.json(
      { error: "Active Alert limit reached, upgrade your plan" },
      { status: 403 },
    );
  }

  if (type && value) {
    const { error } = await supabase.from("alerts").insert(
      {
        user_id: user.id,
        coin_id: coinId,
        target_price: value,
        condition: type,
      });

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

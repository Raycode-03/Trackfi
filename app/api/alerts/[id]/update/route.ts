import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { UpdateAlertInput } from "@/types";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = supabaseAdmin;
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing alert ID" }, { status: 400 });
  }
  const body = await req.json();

  const updates: Partial<UpdateAlertInput> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.condition !== undefined) updates.condition = body.condition;
  if (body.target_price !== undefined) updates.target_price = body.target_price;
  if (body.in_app !== undefined) updates.in_app = body.in_app;
  if (body.email !== undefined) updates.email = body.email;
  if (body.email) {
    updates.email_address = user.email;
  } else if (body.email === false) {
    updates.email_address = "";
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data: alert, error: alertError } = await supabase
    .from("alerts")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (alertError) {
    return NextResponse.json({ error: alertError }, { status: 500 });
  }

  return NextResponse.json({ alert });
}

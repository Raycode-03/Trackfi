import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
export async function DELETE(
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

  const { error: alertError } = await supabase
    .from("alerts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (alertError) {
    return NextResponse.json({ error: alertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

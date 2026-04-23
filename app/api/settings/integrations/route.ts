import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { defaultIntegrations as DEFAULT_INTEGRATIONS } from "@/lib/constants/Integrations";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: connected } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id);

  const integrations = DEFAULT_INTEGRATIONS.map((defaultInt) => {
    const match = connected?.find((c) => c.provider === defaultInt.provider);
    if (match) {
      return {
        ...defaultInt,
        id: match.id,
        status: "connected",
        walletAddress: match.wallet_address,
        connectedAt: match.connected_at,
        lastSyncedAt: match.last_synced_at,
      };
    }
    return {
      ...defaultInt,
      id: null,
      status:
        defaultInt.status === "coming_soon" ? "coming_soon" : "disconnected",
      walletAddress: null,
      connectedAt: null,
      lastSyncedAt: null,
    };
  });

  return NextResponse.json(integrations);
}

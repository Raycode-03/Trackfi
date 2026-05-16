import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { transactionQueue } from "@/lib/queues/transactionsQueue";
import { applyRateLimit } from "@/lib/helpers/applyRateLimit";
import { PLAN_LIMITS } from "@/lib/config/planLimits";
import { Plan } from "@/lib/config/plans";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { success } = await applyRateLimit(request);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id: integrationId } = await params;
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get plan
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("package_type")
      .eq("id", user.id)
      .single();

    const plan = profile?.package_type as Plan;
    const limit = PLAN_LIMITS[plan]?.wallet_syncs_per_month;

    // check wallet sync limit
    if (limit !== null) {
      const { data: usage } = await supabaseAdmin
        .from("usage")
        .select("wallet_syncs_this_month, last_wallet_sync_reset")
        .eq("user_id", user.id)
        .single();

      const lastReset = usage?.last_wallet_sync_reset
        ? new Date(usage.last_wallet_sync_reset)
        : null;
      const now = new Date();
      const isNewMonth =
        !lastReset ||
        lastReset.getMonth() !== now.getMonth() ||
        lastReset.getFullYear() !== now.getFullYear();

      const currentSyncs = isNewMonth ? 0 : (usage?.wallet_syncs_this_month ?? 0);

      if (currentSyncs >= limit) {
        return NextResponse.json(
          { error: "Wallet sync limit reached, upgrade your plan" },
          { status: 403 }
        );
      }

      // increment
      await supabaseAdmin.from("usage").upsert(
        {
          user_id: user.id,
          wallet_syncs_this_month: currentSyncs + 1,
          last_wallet_sync_reset: isNewMonth ? now.toISOString() : usage?.last_wallet_sync_reset,
        },
        { onConflict: "user_id" }
      );
    }

    // get integration
    const { data: integration, error: fetchError } = await supabaseAdmin
      .from("integrations")
      .select("*")
      .eq("id", integrationId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // enqueue sync job
    await transactionQueue.add(
      "fetch_transactions_wallet",
      {
        userId: user.id,
        provider: integration.provider,
        walletAddress: integration.wallet_address,
        integrationId: integration.id,
        lastSyncedAt: integration.last_synced_at,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      }
    );

    return NextResponse.json({ message: "Sync job queued" }, { status: 201 });
  } catch (error) {
    console.error("Error syncing integration:", error);
    return NextResponse.json({ error: "Failed to sync integration" }, { status: 500 });
  }
}
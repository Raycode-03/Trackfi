import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { IntegrationProvider } from "@/types/settings";
import { transactionQueue } from "@/lib/queues/transactionsQueue";
import { redis } from "@/lib/redis";
import { applyRateLimit } from "@/lib/helpers/applyRateLimit";
import { PLAN_LIMITS } from "@/lib/config/planLimits";
import { Plan } from "@/lib/config/plans";

export async function POST(request: NextRequest) {
  try {
    const { success } = await applyRateLimit(request);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, credentials } = body;

    if (!provider || !credentials) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validProviders: IntegrationProvider[] = ["solana", "ethereum", "bitcoin"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
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

      // increment usage
      await supabaseAdmin.from("usage").upsert(
        {
          user_id: user.id,
          wallet_syncs_this_month: currentSyncs + 1,
          last_wallet_sync_reset: isNewMonth ? now.toISOString() : usage?.last_wallet_sync_reset,
        },
        { onConflict: "user_id" }
      );
    }

    // check if already connected
    const { data: existing } = await supabaseAdmin
      .from("integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Integration already connected" }, { status: 400 });
    }

    // save integration
    const { data: connectIntegration, error: insertError } = await supabaseAdmin
      .from("integrations")
      .insert({
        user_id: user.id,
        provider,
        wallet_address: credentials,
        status: "connected",
      })
      .select("*")
      .single();

    if (insertError || !connectIntegration) {
      return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
    }

    // enqueue job
    try {
      await redis.ping();
      await transactionQueue.add("fetch_transactions_wallet", {
        userId: user.id,
        provider,
        walletAddress: credentials,
        integrationId: connectIntegration.id,
        lastSyncedAt: null,
      });
    } catch (queueErr) {
      console.error("Queue error:", queueErr);
    }

    return NextResponse.json("Integration connected successfully", { status: 201 });
  } catch (error) {
    console.error("Error connecting integration:", error);
    return NextResponse.json({ error: "Failed to connect integration" }, { status: 500 });
  }
}
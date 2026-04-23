import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transactionQueue } from "@/lib/queues/transactionsQueue";

// Protect route — only Supabase can call this
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: Request) {
  // Verify secret so random people can't trigger sync
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all connected wallets
  const { data: integrations, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("status", "connected")
    .in("provider", ["metamask", "trustwallet"])
    .not("wallet_address", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!integrations?.length) {
    return NextResponse.json({ message: "No wallets to sync", count: 0 });
  }

  // Queue a job for each wallet
  for (const integration of integrations) {
    await transactionQueue.add(
      "fetch_transactions_wallet",
      {
        userId: integration.user_id,
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
  }

  console.log(`✅ Queued ${integrations.length} wallet sync jobs`);
  return NextResponse.json({ message: "Sync queued", count: integrations.length });
}
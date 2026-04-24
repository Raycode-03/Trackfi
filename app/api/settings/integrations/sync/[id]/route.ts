import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { transactionQueue } from "@/lib/queues/transactionsQueue";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: integrationId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: integration, error: fetchError } = await supabase
      .from("integrations")
      .select("*")
      .eq("id", integrationId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 },
      );
    }

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
      },
    );

    return NextResponse.json({ message: "Sync job queued" }, { status: 201 });
  } catch (error) {
    console.error("Error syncing integration:", error);
    return NextResponse.json(
      { error: "Failed to sync integration" },
      { status: 500 },
    );
  }
}

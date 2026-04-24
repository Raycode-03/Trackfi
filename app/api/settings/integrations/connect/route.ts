import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Integration, IntegrationProvider } from "@/types/settings";
import { transactionQueue } from "@/lib/queues/transactionsQueue";
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, credentials, apiSecret } = body;

    if (!provider || !credentials) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate provider
    const validProviders: IntegrationProvider[] = [
      "metamask",
      "trustwallet",
      "binance",
    ];

    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Integration already connected" },
        { status: 400 },
      );
    }

    const { data: connectIntegration, error: insertError } = await supabase
      .from("integrations")
      .insert({
        user_id: user.id,
        provider,
        wallet_address: credentials,
        status: "connected",
      })
      .select("*")
      .single();
      console.log("Integration saved:", insertError);

    if (insertError || !connectIntegration) {
      return NextResponse.json(
        { error: "Failed to save integration" },
        { status: 500 },
      );
    }

    try {    
        console.log(process.env.ETHERSCAN_API_KEY, 'url')
        await transactionQueue.add("fetch_transactions_wallet", {
          userId: user.id,
          provider,
          walletAddress: credentials,
          integrationId: connectIntegration.id,
          lastSyncedAt: null,
        });
        console.log("Job enqueued successfully");
    }catch(queueErr){
        console.error("Queue error:", queueErr);
    }

    return NextResponse.json("Integration connected successfully", {
      status: 201,
    });
  } catch (error) {
    console.error("Error connecting integration:", error);
    return NextResponse.json(
      { error: "Failed to connect integration" },
      { status: 500 },
    );
  }
}


import { Worker } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import {
  TransactionRow,
  EvmChainMeta,   
} from "./types/transactions";
import { fetchEvm, fetchBtc, fetchSol } from "./helpers/transactionFetcher";
import {mapBtcTx , mapSolTx , mapEvmTx} from "./helpers/transactions"
import { createRedisConnection } from './utils/redis';

// ─── Env Guards ───────────────────────────────────────────────
if (!process.env.REDIS_URL) throw new Error("REDIS_URL is required");
if (!process.env.MORALIS_API_KEY)
  throw new Error("MORALIS_API_KEY is required");
if (!process.env.HELIUS_API_KEY) throw new Error("HELIUS_API_KEY is required");
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
)
  throw new Error("Supabase credentials are required");

const connection = createRedisConnection(process.env.REDIS_URL);


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const EVM_CHAIN_META: Record<string, EvmChainMeta> = {
  ethereum: { moralisChain: "eth", coin_id: "ethereum", symbol: "ETH" },
  polygon: {
    moralisChain: "polygon",
    coin_id: "matic-network",
    symbol: "MATIC",
  },
  base: { moralisChain: "base", coin_id: "ethereum", symbol: "ETH" },
  bsc: { moralisChain: "bsc", coin_id: "binancecoin", symbol: "BNB" },
  arbitrum: { moralisChain: "arbitrum", coin_id: "ethereum", symbol: "ETH" },
};



// ─── Worker ───────────────────────────────────────────────────
const worker = new Worker(
  "transactionQueue",
  async (job) => {
    const { userId, walletAddress, integrationId, lastSyncedAt, provider } =
      job.data;
    console.log(
      `🔄 Syncing ${walletAddress} for user ${userId} on ${provider}`,
    );

    const lastSync = lastSyncedAt ? new Date(lastSyncedAt) : null;

    let rows: TransactionRow[] = [];

    if (provider === "bitcoin") {
      const txs = await fetchBtc(walletAddress);
      const newTxs = lastSync
        ? txs.filter((tx) => new Date(tx.status.block_time * 1000) > lastSync)
        : txs;
      rows = newTxs.map((tx) => mapBtcTx(tx, walletAddress, userId));
    } else if (provider === "solana") {
      const txs = await fetchSol(walletAddress);
      const newTxs = lastSync
        ? txs.filter((tx) => new Date(tx.timestamp * 1000) > lastSync)
        : txs;
      rows = newTxs
        .map((tx) => mapSolTx(tx, walletAddress, userId))
        .filter(Boolean) as TransactionRow[];
    } else {
      const evmMeta = EVM_CHAIN_META[provider];
      if (!evmMeta) throw new Error(`Unsupported provider: ${provider}`);
      const txs = await fetchEvm(walletAddress, evmMeta.moralisChain);
      const newTxs = lastSync
        ? txs.filter((tx) => new Date(tx.block_timestamp) > lastSync)
        : txs;
      rows = newTxs.map((tx) =>
        mapEvmTx(tx, walletAddress, userId, evmMeta, provider),
      );
    }

    console.log(`📦 Found ${rows.length} new transactions`);
    if (rows.length === 0) return { success: true, count: 0 };

    const { data: profile } = await supabase
      .from("profiles")
      .select("package_type")
      .eq("id", userId)
      .single();

    const planLimits = {
      free: 100,
      pro: 1000,
      enterprise: null,
    };

    const limit =
      planLimits[profile?.package_type as keyof typeof planLimits] ?? 100;

    if (limit !== null) {
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (count !== null && count >= limit) {
        console.log(
          `⚠️ Transaction limit reached for user ${userId} on ${profile?.package_type} plan`,
        );
        return { success: false, reason: "Transaction limit reached" };
      }
    }
    // Upsert transactions
    const { error: insertError } = await supabase
      .from("transactions")
      .upsert(rows, { onConflict: "user_id,tx_hash" });
    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    // Update holdings
    const coinIds = [...new Set(rows.map((r) => r.coin_id))];
    for (const coinId of coinIds) {
      const { data: allCoinTxs, error: allTxsError } = await supabase
        .from("transactions")
        .select("type, amount, symbol")
        .eq("user_id", userId)
        .eq("coin_id", coinId)
        .eq("status", "completed");
      if (allTxsError)
        throw new Error(`Holdings fetch failed: ${allTxsError.message}`);

      const totalHolding =
        allCoinTxs?.reduce((acc, tx) => {
          if (tx.type === "deposit" || tx.type === "buy")
            return acc + tx.amount;
          if (tx.type === "withdrawal" || tx.type === "sell")
            return acc - tx.amount;
          return acc;
        }, 0) ?? 0;

      const { error: holdingError } = await supabase
        .from("holdings")
        .upsert(
          {
            user_id: userId,
            coin_id: coinId,
            amount: totalHolding,
            source: "wallet",
          },
          { onConflict: "user_id,coin_id" },
        );
      if (holdingError)
        throw new Error(`Holdings update failed: ${holdingError.message}`);
      console.log(`[HOLDINGS] Updated ${coinId} to ${totalHolding}`);
    }

    // Update last_synced_at
    const { error: syncError } = await supabase
      .from("integrations")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", integrationId);
    if (syncError) throw new Error(`Sync update failed: ${syncError.message}`);

    console.log(`✅ Synced ${rows.length} transactions for ${walletAddress}`);
    return { success: true, count: rows.length };
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
);

worker.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
worker.on("failed", (job, err) =>
  console.error(`❌ Job ${job?.id} failed:`, err.message),
);
worker.on("error", (err) => console.error("Worker error:", err));

console.log("🚀 Transaction worker started");

process.on("SIGTERM", async () => {
  await worker.close();
  connection.quit();
});
process.on("unhandledRejection", (reason) =>
  console.error("[UNHANDLED]", reason),
);
process.on("uncaughtException", (error) => console.error("[UNCAUGHT]", error));

import { Worker } from "bullmq";
import Redis from "ioredis";
import { createClient } from "@supabase/supabase-js";

interface EtherscanTx {
  hash: string;
  from: string;
  to: string;
  value: string; // in Wei
  timeStamp: string;
  isError: string; // "0" = success, "1" = failed
  gas: string;
  gasPrice: string;
  gasUsed: string;
  blockNumber: string;
  contractAddress: string;
  input: string;
}
// ─── Env Guards ───────────────────────────────────────────────
if (!process.env.REDIS_URL) throw new Error("REDIS_URL is required");
if (!process.env.ETHERSCAN_API_KEY)
  throw new Error("ETHERSCAN_API_KEY is required");
if (!process.env.COINGECKO_API_KEY)
  throw new Error("COINGECKO_API_KEY is required");
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
)
  throw new Error("Supabase credentials are required");

// ─── Connections ──────────────────────────────────────────────
const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {},
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const weiToEth = (wei: string) => Number(wei) / 1e18;

const inferType = (
  walletAddress: string,
  from: string,
): "withdrawal" | "deposit" =>
  from.toLowerCase() === walletAddress.toLowerCase() ? "withdrawal" : "deposit";

const getDateKey = (timestamp: number) => {
  const d = new Date(timestamp * 1000);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// Fetch ETH price on a specific date from CoinGecko
const getEthPriceOnDate = async (dateKey: string): Promise<number> => {
  try {
    await new Promise((r) => setTimeout(r, 1100));

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${dateKey}&localization=false`,
      { headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY! } },
    );

    if (!res.ok) {
      console.warn(`CoinGecko failed for date ${dateKey}: ${res.status}`);
      return 0;
    }

    const data = await res.json();
    return data.market_data?.current_price?.usd ?? 0;
  } catch (err) {
    console.warn(`Failed to get price for ${dateKey}:`, err);
    return 0;
  }
};

const worker = new Worker(
  "transactionQueue",
  async (job) => {
    const { userId, walletAddress, integrationId, lastSyncedAt } = job.data;

    console.log(`🔄 Syncing wallet ${walletAddress} for user ${userId}...`);

    const isFirstSync = !lastSyncedAt;
    const limit = isFirstSync ? 50 : 10000;
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&sort=desc&page=1&offset=${limit}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== "1" && json.message !== "No transactions found") {
      throw new Error(`Etherscan error: ${json.message}`);
    }

    const txs: E[] = json.result ?? [];
    console.log(`📦 Total transactions on chain: ${txs.length}`);

    // 2. Filter new transactions since last sync + skip zero value (contract calls)
    const lastSync = lastSyncedAt ? new Date(lastSyncedAt).getTime() / 1000 : 0;
    const newTxs = txs.filter(
      (tx) => tx.value !== "0" && Number(tx.timeStamp) > lastSync,
    );

    console.log(`🆕 New transactions to sync: ${newTxs.length}`);

    if (newTxs.length === 0) {
      console.log("✅ Nothing to sync");
      return { success: true, count: 0 };
    }

    // 3. Get unique dates — batch CoinGecko calls
    const uniqueDateKeys = [
      ...new Set(newTxs.map((tx) => getDateKey(Number(tx.timeStamp)))),
    ];
    console.log(
      `📅 Fetching ETH price for ${uniqueDateKeys.length} unique dates...`,
    );

    // 4. Fetch price for each unique date (with rate limiting built in)
    const priceCache: Record<string, number> = {};
    for (const dateKey of uniqueDateKeys) {
      priceCache[dateKey] = await getEthPriceOnDate(dateKey);
      console.log(`💰 ETH price on ${dateKey}: $${priceCache[dateKey]}`);
    }

    // 5. Map to your transactions table shape
    const rows = newTxs.map((tx) => {
      const ts = Number(tx.timeStamp);
      const dateKey = getDateKey(ts);
      const price = priceCache[dateKey] ?? 0;
      const amount = weiToEth(tx.value);

      return {
        user_id: userId,
        coin_id: "ethereum",
        symbol: "ETH",
        type: inferType(walletAddress, tx.from),
        amount,
        price, // ETH price on the day of tx
        total_value: amount * price, // what it was worth when tx happened
        status: tx.isError === "0" ? "completed" : "failed",
        network: "ethereum",
        date: new Date(ts * 1000).toISOString(),
        tx_hash: tx.hash,
      };
    });

    // 6. Upsert — tx_hash prevents duplicates
    const { error: insertError } = await supabase
      .from("transactions")
      .upsert(rows, { onConflict: "user_id,tx_hash" });

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    // 7. Update last_synced_at on integration
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
    concurrency: 5, // process 5 wallets at once
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
);

// ─── Events ───────────────────────────────────────────────────
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

console.log("🚀 Transaction worker started");

// ─── Graceful Shutdown ────────────────────────────────────────
process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  connection.quit();
});

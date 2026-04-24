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
    console.log(`[COINGECKO_INIT] Starting price fetch for date: ${dateKey}`);
    await new Promise((r) => setTimeout(r, 1100));
    console.log(`[COINGECKO_RATE_LIMIT] Rate limit wait completed`);

    const url = `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${dateKey}&localization=false`;
    console.log(`[COINGECKO_REQUEST] URL: ${url}`);

    const res = await fetch(url, {
      headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY! },
    });
    console.log(`[COINGECKO_RESPONSE] Status: ${res.status}, OK: ${res.ok}`);

    if (!res.ok) {
      console.warn(
        `[COINGECKO_FAILED] CoinGecko failed for date ${dateKey}: status ${res.status}`,
      );
      return 0;
    }

    const data = await res.json();
    const price = data.market_data?.current_price?.usd ?? 0;
    console.log(`[COINGECKO_PRICE] Date: ${dateKey}, Price: $${price}`);
    return price;
  } catch (err) {
    console.error(
      `[COINGECKO_FETCH_ERROR] Failed to get price for ${dateKey}:`,
      err,
    );
    return 0;
  }
};

const worker = new Worker(
  "transactionQueue",
  async (job) => {
    console.log("\n\n========== [WORKER_START] JOB RECEIVED ==========");
    const { userId, walletAddress, integrationId, lastSyncedAt, provider } =
      job.data;

    console.log(`[INPUT] Job ID: ${job.id}`);
    console.log(`[INPUT] User ID: ${userId}`);
    console.log(`[INPUT] Wallet Address: ${walletAddress}`);
    console.log(`[INPUT] Integration ID: ${integrationId}`);
    console.log(`[INPUT] Provider: ${provider}`);
    console.log(`[INPUT] Last Synced At: ${lastSyncedAt}`);

    console.log(`🔄 Syncing wallet ${walletAddress} for user ${userId}...`);

    const isFirstSync = !lastSyncedAt;
    const limit = isFirstSync ? 50 : 10000;
    console.log(`[SYNC_CONFIG] Is First Sync: ${isFirstSync}, Limit: ${limit}`);

    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${walletAddress}&sort=desc&page=1&offset=${limit}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    console.log(`[ETHERSCAN_REQUEST] URL: ${url.substring(0, 150)}...`);

    let res;
    try {
      console.log(`[ETHERSCAN_FETCH] Fetching from Etherscan...`);
      res = await fetch(url);
      console.log(
        `[ETHERSCAN_RESPONSE] Status code: ${res.status}, OK: ${res.ok}`,
      );
    } catch (fetchErr) {
      console.error(`[ETHERSCAN_FETCH_ERROR] Fetch failed:`, fetchErr);
      throw fetchErr;
    }

    let json;
    try {
      console.log(`[JSON_PARSE] Parsing response...`);
      json = await res.json();
      console.log(
        `[JSON_SUCCESS] Parsed response status: ${json.status}, message: ${json.message}`,
      );
    } catch (parseErr) {
      console.error(`[JSON_PARSE_ERROR] Failed to parse JSON:`, parseErr);
      throw parseErr;
    }

    if (json.status !== "1" && json.message !== "No transactions found") {
      console.error(
        `[ETHERSCAN_API_ERROR] Status: ${json.status}, Message: ${json.message}`,
      );
      throw new Error(`Etherscan error: ${json.message}`);
    }

    const txs: EtherscanTx[] = json.result ?? [];
    console.log(`📦 Total transactions on chain: ${txs.length}`);
    console.log(`[TX_FETCH] Got ${txs.length} transactions from Etherscan`);

    // 2. Filter new transactions since last sync + skip zero value (contract calls)
    const lastSync = lastSyncedAt ? new Date(lastSyncedAt).getTime() / 1000 : 0;
    console.log(`[FILTER_START] Last sync timestamp (seconds): ${lastSync}`);
    console.log(
      `[FILTER_START] Filtering transactions with value > 0 and timestamp > ${lastSync}`,
    );

    const newTxs = txs.filter(
      (tx) => tx.value !== "0" && Number(tx.timeStamp) > lastSync,
    );

    console.log(`🆕 New transactions to sync: ${newTxs.length}`);
    console.log(
      `[TX_FILTER] Filtered from ${txs.length} to ${newTxs.length} transactions`,
    );
    console.log(
      `[TX_FILTER_DETAILS] Zero-value txs: ${txs.filter((tx) => tx.value === "0").length}, Old txs: ${txs.filter((tx) => Number(tx.timeStamp) <= lastSync).length}`,
    );

    if (newTxs.length === 0) {
      console.log("✅ Nothing to sync");
      console.log(`[NO_NEW_TXS] Returning early with count: 0`);
      return { success: true, count: 0 };
    }

    // 3. Get unique dates — batch CoinGecko calls
    console.log(
      `[DATE_EXTRACTION] Extracting unique dates from ${newTxs.length} transactions...`,
    );
    const uniqueDateKeys = [
      ...new Set(newTxs.map((tx) => getDateKey(Number(tx.timeStamp)))),
    ];
    console.log(`[UNIQUE_DATES] Found ${uniqueDateKeys.length} unique dates`);
    console.log(`[UNIQUE_DATES_LIST] Dates: ${uniqueDateKeys.join(", ")}`);
    console.log(
      `📅 Fetching ETH price for ${uniqueDateKeys.length} unique dates...`,
    );

    // 4. Fetch price for each unique date (with rate limiting built in)
    console.log(
      `[PRICE_FETCH_START] Starting to fetch ETH prices for ${uniqueDateKeys.length} dates...`,
    );
    const priceCache: Record<string, number> = {};
    for (let i = 0; i < uniqueDateKeys.length; i++) {
      const dateKey = uniqueDateKeys[i];
      console.log(
        `[PRICE_FETCH] Fetching price ${i + 1}/${uniqueDateKeys.length} for date: ${dateKey}`,
      );
      try {
        priceCache[dateKey] = await getEthPriceOnDate(dateKey);
        console.log(`💰 ETH price on ${dateKey}: $${priceCache[dateKey]}`);
        console.log(
          `[PRICE_CACHE] Cached price for ${dateKey}: ${priceCache[dateKey]}`,
        );
      } catch (priceErr) {
        console.error(
          `[PRICE_FETCH_ERROR] Failed to fetch price for ${dateKey}:`,
          priceErr,
        );
        priceCache[dateKey] = 0; // fallback to 0
      }
    }
    console.log(`[PRICE_FETCH_COMPLETE] Fetched prices for all dates`);
    console.log(
      `[PRICE_CACHE_FINAL] Cache:`,
      JSON.stringify(priceCache, null, 2),
    );

    // 5. Map to your transactions table shape
    console.log(
      `[MAPPING_START] Mapping ${newTxs.length} transactions to database schema...`,
    );
    const rows = newTxs.map((tx, idx) => {
      const ts = Number(tx.timeStamp);
      const dateKey = getDateKey(ts);
      const price = priceCache[dateKey] ?? 0;
      const amount = weiToEth(tx.value);
      const txType = inferType(walletAddress, tx.from);
      const status = tx.isError === "0" ? "completed" : "failed";

      if (idx === 0 || idx === newTxs.length - 1) {
        console.log(
          `[MAPPING_SAMPLE_${idx}] TX: hash=${tx.hash}, amount=${amount} ETH, price=$${price}, type=${txType}, status=${status}`,
        );
      }

      return {
        user_id: userId,
        coin_id: "ethereum",
        symbol: "ETH",
        type: txType,
        amount,
        price, // ETH price on the day of tx
        total_value: amount * price, // what it was worth when tx happened
        status: status,
        network: "ethereum",
        date: new Date(ts * 1000).toISOString(),
        tx_hash: tx.hash,
      };
    });
    console.log(`[MAPPING_COMPLETE] Mapped ${rows.length} rows`);
    console.log(
      `[MAPPED_ROW_SAMPLE] First row:`,
      JSON.stringify(rows[0], null, 2),
    );

    // 6. Upsert — tx_hash prevents duplicates
    console.log(
      `[UPSERT_START] Upserting ${rows.length} rows to transactions table...`,
    );
    console.log(`[UPSERT_CONFIG] onConflict: user_id,tx_hash`);

    let insertError;
    let upsertData;
    try {
      const result = await supabase
        .from("transactions")
        .upsert(rows, { onConflict: "user_id,tx_hash" });
      insertError = result.error;
      upsertData = result.data;
      console.log(
        `[UPSERT_RESPONSE] Error: ${insertError ? insertError.message : "null"}`,
      );
      console.log(
        `[UPSERT_RESPONSE] Data length: ${Array.isArray(upsertData) ? upsertData.length : "not array"}`,
      );
    } catch (upsertErr) {
      console.error(`[UPSERT_EXCEPTION] Upsert threw exception:`, upsertErr);
      throw upsertErr;
    }

    if (insertError) {
      console.error(`[UPSERT_ERROR] Insert error: ${insertError.message}`);
      console.error(`[UPSERT_ERROR] Error code: ${insertError.code}`);
      console.error(
        `[UPSERT_ERROR] Error details:`,
        JSON.stringify(insertError, null, 2),
      );
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    console.log(
      `[UPSERT_SUCCESS] Successfully upserted ${rows.length} transactions`,
    );
    // 7. Update last_synced_at on integration
    const newSyncTime = new Date().toISOString();
    console.log(
      `[SYNC_UPDATE_START] Updating integration last_synced_at to ${newSyncTime}`,
    );
    console.log(`[SYNC_UPDATE_START] Integration ID: ${integrationId}`);

    let syncError;
    let syncData;
    try {
      const result = await supabase
        .from("integrations")
        .update({ last_synced_at: newSyncTime })
        .eq("id", integrationId);
      syncError = result.error;
      syncData = result.data;
      console.log(
        `[SYNC_UPDATE_RESPONSE] Error: ${syncError ? syncError.message : "null"}`,
      );
      console.log(
        `[SYNC_UPDATE_RESPONSE] Data:`,
        syncData ? "updated" : "null",
      );
    } catch (syncUpdateErr) {
      console.error(
        `[SYNC_UPDATE_EXCEPTION] Sync update threw exception:`,
        syncUpdateErr,
      );
      throw syncUpdateErr;
    }

    if (syncError) {
      console.error(`[SYNC_UPDATE_ERROR] Sync error: ${syncError.message}`);
      console.error(`[SYNC_UPDATE_ERROR] Error code: ${syncError.code}`);
      throw new Error(`Sync update failed: ${syncError.message}`);
    }

    console.log(`✅ Synced ${rows.length} transactions for ${walletAddress}`);
    console.log(`[JOB_COMPLETE] Successfully completed sync job`);
    console.log(`========== [WORKER_END] JOB SUCCESS ==========\n`);
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
  console.log(`✅ [EVENT_COMPLETED] Job ${job.id} completed successfully`);
  console.log(`[EVENT_COMPLETED] Job result:`, job.returnvalue);
});

worker.on("failed", (job, err) => {
  console.error(`❌ [EVENT_FAILED] Job ${job?.id} failed`);
  console.error(`[EVENT_FAILED] Error message: ${err.message}`);
  console.error(`[EVENT_FAILED] Error stack:`, err.stack);
  if (job?.data) {
    console.error(
      `[EVENT_FAILED] Job data:`,
      JSON.stringify(job.data, null, 2),
    );
  }
});

worker.on("error", (err) => {
  console.error("[EVENT_ERROR] Worker error:", err);
  console.error("[EVENT_ERROR] Error stack:", err.stack);
});

console.log("🚀 Transaction worker started");
console.log(
  `[WORKER_INIT] Redis URL configured: ${process.env.REDIS_URL ? "yes" : "NO"}`,
);
console.log(
  `[WORKER_INIT] Etherscan API key configured: ${process.env.ETHERSCAN_API_KEY ? "yes" : "NO"}`,
);
console.log(
  `[WORKER_INIT] CoinGecko API key configured: ${process.env.COINGECKO_API_KEY ? "yes" : "NO"}`,
);
console.log(
  `[WORKER_INIT] Supabase URL configured: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "yes" : "NO"}`,
);
console.log(
  `[WORKER_INIT] Supabase service role configured: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "yes" : "NO"}`,
);

// ─── Graceful Shutdown ────────────────────────────────────────
process.on("SIGTERM", async () => {
  console.log("[SHUTDOWN] Shutting down worker...");
  await worker.close();
  connection.quit();
  console.log("[SHUTDOWN] Worker closed and connection quit");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[UNHANDLED_REJECTION] Promise rejected:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT_EXCEPTION] Exception thrown:", error);
});

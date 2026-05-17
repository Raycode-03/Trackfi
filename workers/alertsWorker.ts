import { Queue, Worker } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import webpush from "web-push";
import {MarketCoin} from "./types/alerts"
import { createRedisConnection } from './utils/redis';

if (!process.env.REDIS_URL) throw new Error("REDIS_URL is required");
if (!process.env.MORALIS_API_KEY)
  throw new Error("MORALIS_API_KEY is required");
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
)
  throw new Error("Supabase credentials are required");
if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is required");
}
if (
  !process.env.VAPID_PUBLIC_KEY ||
  !process.env.VAPID_PRIVATE_KEY ||
  !process.env.VAPID_MAILTO
)
  throw new Error("VAPID credentials are required");

webpush.setVapidDetails(
  process.env.VAPID_MAILTO,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);
const connection = createRedisConnection(process.env.REDIS_URL);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const alertQueue = new Queue("alert-checks", { connection });

async function startAlertWorker() {
  await alertQueue.obliterate({ force: true }).catch(() => {});

  // Free tier: check every 5 minutes
  await alertQueue.add(
    "check-alerts",
    { tier: "free" },
    {
      repeat: { every: 300000 }, // 5 min
      jobId: "check-alerts-free",
    },
  );

  // Pro tier: check every 2 minutes
  await alertQueue.add(
    "check-alerts",
    { tier: "pro" },
    {
      repeat: { every: 120000 }, // 2 min
      jobId: "check-alerts-pro",
    },
  );

  // Enterprise tier: check every 60 seconds
  await alertQueue.add(
    "check-alerts",
    { tier: "enterprise" },
    {
      repeat: { every: 60000 }, // 60s
      jobId: "check-alerts-enterprise",
    },
  );

  console.log(
    "✅ Alert repeat jobs registered (Free: 5min, Pro: 2min, Enterprise: 60s)",
  );
}
const resend = new Resend(process.env.RESEND_API_KEY);

const alertWorker = new Worker(
  "alert-checks",
  async (job) => {
    const tier = job.data.tier || "enterprise";
    console.log(`🔔 Checking alerts for ${tier} tier...`);

    // 1. get all active alerts
    const { data: alerts, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("status", "active");
    if (error) {
      console.error("Failed to fetch alerts:", error);
      return;
    }
    if (!alerts?.length) {
      console.log("No active alerts");
      return;
    }
    // 2. get user ids from alerts
    const userIds = [...new Set(alerts.map((a) => a.user_id))];

    // 3. get profiles for those users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, package_type")
      .in("id", userIds);

    // 2. Filter alerts by tier
    const profileMap = new Map(profiles?.map((p) => [p.id, p.package_type]));
    const tieredAlerts = alerts.filter(
      (a) => profileMap.get(a.user_id) === tier,
    );
    if (!tieredAlerts.length) {
      console.log(`No active alerts for ${tier} tier`);
      return;
    }

    // 3. Get unique coin ids
    const ids = [...new Set(tieredAlerts.map((a) => a.coin_id))].join(",");

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`,
      { headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY! } },
    );
    if (res.status === 429) {
      console.warn("⚠️ CoinGecko rate limited, skipping this check");
      return;
    }
    if (!res.ok) {
      console.error("Failed to fetch market data for alerts:", res.statusText);
      return;
    }

    const coins = await res.json();
    const priceMap = new Map(
      coins.map((c: MarketCoin) => [c.id, c.current_price]),
    );

    for (const alert of tieredAlerts) {
      const currentPrice = priceMap.get(alert.coin_id);
      if (!currentPrice) continue;

      const triggered =
        (alert.condition === "above" && currentPrice >= alert.target_price) ||
        (alert.condition === "below" && currentPrice <= alert.target_price);

      if (!triggered) continue;

      console.log(
        `🔔 Alert triggered: ${alert.coin_id} ${alert.condition} ${alert.target_price}`,
      );

      await supabase
        .from("alerts")
        .update({
          triggered_recently: true,
          last_price: currentPrice,
          status: "paused",
        })
        .eq("id", alert.id);

      await supabase.from("notifications").insert({
        user_id: alert.user_id,
        alert_id: alert.id,
        coin_id: alert.coin_id,
        type: "price_alert",
        title: `${alert.coin_id} Alert Triggered`,
        message: `${alert.coin_id} is ${alert.condition} $${alert.target_price.toLocaleString()}. Current price: $${currentPrice.toLocaleString()}`,
        is_read: false,
      });

      // fetch all push subscriptions for this user
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("subscription")
        .eq("user_id", alert.user_id);

      if (subscriptions?.length) {
        const payload = JSON.stringify({
          title: `${alert.coin_id} Alert Triggered`,
          message: `${alert.coin_id} is ${alert.condition} $${alert.target_price.toLocaleString()}. Current: $${currentPrice.toLocaleString()}`,
          url: "/alerts",
        });

        await Promise.allSettled(
          subscriptions.map((row) =>
            webpush
              .sendNotification(row.subscription, payload)
              .catch(async (err) => {
                // subscription expired or invalid — remove it
                if (err.statusCode === 404 || err.statusCode === 410) {
                  await supabase
                    .from("push_subscriptions")
                    .delete()
                    .eq("subscription->>endpoint", row.subscription.endpoint);
                  console.log(
                    `🗑️ Removed expired subscription for ${alert.user_id}`,
                  );
                }
              }),
          ),
        );
        console.log(
          `📲 Push sent to ${subscriptions.length} device(s) for ${alert.coin_id}`,
        );
      }

      if (alert.email && alert.email_address) {
        await resend.emails.send({
          from: "Trackfi <onboarding@resend.dev>",
          to: alert.email_address,
          subject: `🔔 Alert Triggered: ${alert.coin_id} is ${alert.condition} $${alert.target_price}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #111;">Price Alert Triggered 🔔</h1>
              <p>Your alert for <strong>${alert.coin_id}</strong> has been triggered.</p>
              <p>Condition: Price <strong>${alert.condition}</strong> $${alert.target_price.toLocaleString()}</p>
              <p>Current Price: <strong>$${currentPrice.toLocaleString()}</strong></p>
              <hr />
              <p style="color: #666; font-size: 14px;">— The Trackfi Team</p>
            </div>
          `,
        });
        console.log(`📧 Alert email sent for ${alert.coin_id}`);
      }
    }
  },
  {
    connection,
    concurrency: 1,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
);

alertWorker.on("completed", (job) => {
  console.log(`✅ Alert check ${job.id} done`);
});

alertWorker.on("failed", (job, err) => {
  console.error(`❌ Alert check ${job?.id} failed:`, err.message);
});

startAlertWorker();

export { alertQueue };

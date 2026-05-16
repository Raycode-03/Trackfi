import { Worker } from "bullmq";
import { Resend } from "resend";
import { validateEmailWorkerEnv } from "./utils/env-guards";
import { getRedisConnection } from "./utils/redis";
validateEmailWorkerEnv();
const connection = getRedisConnection();

// const connection = new Redis(process.env.REDIS_URL, {
//   maxRetriesPerRequest: null,
//   tls: {},
// });

const resend = new Resend(process.env.RESEND_API_KEY);

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { email, name } = job.data;

    console.log(`📧 Sending email to ${email}...`);

    try {
      const { data, error } = await resend.emails.send({
        from: "Trackfi <onboarding@resend.dev>", // Use resend.dev for testing
        to: email,
        subject: "Welcome to Trackfi! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #111;">Welcome to Trackfi! 🎉</h1>
            <p>Hi ${name || "there"} 👋</p>
            <p>Thank you for signing up with <strong>Trackfi</strong> 📊</p>
            <p>We're excited to have you on board!</p>
            <hr />
            <p style="color: #666; font-size: 14px;">— The Trackfi Team</p>
          </div>
        `,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`✅ Email sent to ${email} - ID: ${data?.id}`);
      return { success: true, id: data.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ Failed:`, message);
      throw err;
    }
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log("🚀 Email worker started with Resend");

process.on("SIGTERM", async () => {
  await worker.close();
  connection.quit();
});

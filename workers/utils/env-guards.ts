// ─── Environment Guards ───────────────────────────────────────────────

export function validateTransactionWorkerEnv() {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL is required");
  if (!process.env.MORALIS_API_KEY)
    throw new Error("MORALIS_API_KEY is required");
  if (!process.env.HELIUS_API_KEY)
    throw new Error("HELIUS_API_KEY is required");
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Supabase credentials are required");
  }
}

export function validateAlertsWorkerEnv() {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL is required");
  if (!process.env.MORALIS_API_KEY)
    throw new Error("MORALIS_API_KEY is required");
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Supabase credentials are required");
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required");
  }
  if (
    !process.env.VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY ||
    !process.env.VAPID_MAILTO
  ) {
    throw new Error("VAPID credentials are required");
  }
}

export function validateEmailWorkerEnv() {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is required");
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required");
  }
}

export function validateAllEnv() {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL is required");
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Supabase credentials are required");
  }
}

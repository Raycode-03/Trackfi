import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "@/utils/supabase/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "5 m"),
});

export async function applyRateLimit(req: Request , useIp = false) {
   if (useIp) {
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    return ratelimit.limit(ip);
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const identifier = user?.id ?? req.headers.get("x-forwarded-for") ?? "anonymous";
  
  return ratelimit.limit(identifier);
}
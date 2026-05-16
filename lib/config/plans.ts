export type Plan = "free" | "pro" | "enterprise";

export const PLAN_NAMES = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

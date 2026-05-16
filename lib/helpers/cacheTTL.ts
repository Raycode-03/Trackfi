import { Plan } from "@/lib/config/plans";

export type Route =
  | "market"
  | "watchlist"
  | "alerts"
  | "dashboard"
  | "transactions";

const TTL_MAP: Record<Route, Record<Plan, number>> = {
  market: { free: 300, pro: 120, enterprise: 60 },
  watchlist: { free: 300, pro: 120, enterprise: 60 },
  alerts: { free: 600, pro: 300, enterprise: 120 },
  dashboard: { free: 600, pro: 300, enterprise: 120 },
  transactions: { free: 900, pro: 600, enterprise: 300 },
};

// backend — returns seconds
export function getCacheTTL(route: Route, plan: Plan): number {
  return TTL_MAP[route][plan] ?? 600;
}

// frontend — returns milliseconds for staleTime
export function getStaleTime(route: Route, plan: Plan): number {
  return (TTL_MAP[route][plan] ?? 600) * 1000;
}

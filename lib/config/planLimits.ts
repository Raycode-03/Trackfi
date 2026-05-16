// lib/config/planLimits.ts
import { Plan } from "@/lib/config/plans";

export const PLAN_LIMITS: Record<
  Plan,
  {
    active_alerts: number | null;
    watchlist_items: number | null;
    chart_views_per_day: number | null;
    wallet_syncs_per_month: number | null;
    transactions_stored: number | null;
  }
> = {
  free: {
    active_alerts: 2,
    watchlist_items: 10,
    chart_views_per_day: 20,
    wallet_syncs_per_month: 2,
    transactions_stored: 100,
  },
  pro: {
    active_alerts: 15,
    watchlist_items: 50,
    chart_views_per_day: 100,
    wallet_syncs_per_month: 10,
    transactions_stored: 1000,
  },
  enterprise: {
    active_alerts: null, // null = unlimited
    watchlist_items: null,
    chart_views_per_day: null,
    wallet_syncs_per_month: null,
    transactions_stored: null,
  },
};

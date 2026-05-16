import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/index";
import { getStaleTime } from "../helpers/cacheTTL";
import { usePlan } from "../helpers/usePlan";

export const usePortfolioStats = () => {
  const plan = usePlan();
  return useQuery({
    queryKey: ["portfolio-stats", plan],
    queryFn: dashboardApi.fetchPortfolioStats,
    staleTime: getStaleTime("dashboard", plan),
  });
};

export const useWatchlistPrices = () => {
  const plan = usePlan();
  return useQuery({
    queryKey: ["watchlist-prices", plan],
    queryFn: dashboardApi.fetchWatchlistPrices,
    staleTime: getStaleTime("market", plan),
  });
};

export const useRecentTransactions = () => {
  const plan = usePlan();
  return useQuery({
    queryKey: ["recent-transactions", plan],
    queryFn: dashboardApi.fetchRecentTransactions,
    staleTime: getStaleTime("transactions", plan),
  });
};

export const useAssetAllocation = () => {
  const plan = usePlan();
  return useQuery({
    queryKey: ["asset-allocation", plan],
    queryFn: dashboardApi.fetchAssetAllocation,
    staleTime: getStaleTime("dashboard", plan),
  });
};

export const useSmartAlerts = () => {
  const plan = usePlan();
  return useQuery({
    queryKey: ["smart-alerts", plan],
    queryFn: dashboardApi.fetchActiveAlerts,
    staleTime: getStaleTime("alerts", plan),
  });
};

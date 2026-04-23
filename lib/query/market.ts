import { useQuery } from "@tanstack/react-query";
import { fetchMarketlist, fetchCoinDetail, fetchCoinChart } from "../api/index";
import { TimeRange } from "@/types/markets";

export const useMarkets = (page = 1, search = "") =>
  useQuery({
    queryKey: ["marketlist", page, search],
    queryFn: () => fetchMarketlist(page, search),
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, 
  });

export const useCoinDetail = (id: string) =>
  useQuery({
    queryKey: ["coin-detail", id],
    queryFn: () => fetchCoinDetail(id),
    staleTime: 1000 * 30 * 5,
  });
export const useCoinChart = (
  id: string,
  range: string,
  beforeTs?: number | null,
) =>
  useQuery({
    queryKey: ["coin-chart", id, range, beforeTs],
    queryFn: () => fetchCoinChart(id, range as TimeRange, beforeTs),
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      const noRetry = ["RATE_LIMITED", "TIER_UNAVAILABLE", "UNAUTHORIZED"];
      if (noRetry.includes(error.message)) return false;
      return failureCount < 2;
    },
  });

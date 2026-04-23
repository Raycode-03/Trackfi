import { useQuery } from '@tanstack/react-query'
import { fetchWatchlist , fetchWatchlistStats } from '../api/index'

export const useWatchlist = (page = 1) =>
  useQuery({
    queryKey: ["watchlist", page],
    queryFn: () => fetchWatchlist(page),
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
export const useWatchlistStats = () =>
    useQuery({
        queryKey: ['watchlist-stats'],
        queryFn: fetchWatchlistStats,
        refetchInterval: 30000,
        staleTime: 1000 * 60 * 5,
    })

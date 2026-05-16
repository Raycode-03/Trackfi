import { useQuery } from '@tanstack/react-query'
import { fetchWatchlist , fetchWatchlistStats } from '../api/index'
import { getStaleTime } from '../helpers/cacheTTL';
import { usePlan } from '../helpers/usePlan';
export const useWatchlist = (page = 1) =>{
  const plan = usePlan()
  return useQuery({
    queryKey: ["watchlist", page],
    queryFn: () => fetchWatchlist(page),
    staleTime: getStaleTime("watchlist",  plan),
    placeholderData: (prev) => prev,
  })
}
export const useWatchlistStats = () => {
  const plan = usePlan()
 return useQuery({
    queryKey: ['watchlist-stats'],
    queryFn: fetchWatchlistStats,
    staleTime: getStaleTime("watchlist",  plan),
  });
}
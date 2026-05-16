import { useQuery } from '@tanstack/react-query'
import { fetchTransactions, fetchTransactionStats } from '@/lib/api/transactions'
import { getStaleTime } from '../helpers/cacheTTL';
import { usePlan } from '../helpers/usePlan';
export const useTransactions = (page = 1, period = "30") => {
  const plan = usePlan()
 return useQuery({
    queryKey: ["transactions", page, period],
    queryFn: () => fetchTransactions(page, period),
    staleTime: getStaleTime("transactions",  plan),
    placeholderData: (prev) => prev,
  });
}
export const useTransactionStats = (period = "30") =>{
  const plan = usePlan()
  return useQuery({
    queryKey: ["transaction-stats", period],
    queryFn: () => fetchTransactionStats(period),
    staleTime: getStaleTime("transactions",  plan),
  });
}
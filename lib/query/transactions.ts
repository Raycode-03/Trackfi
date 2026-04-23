import { useQuery } from '@tanstack/react-query'
import { fetchTransactions, fetchTransactionStats } from '@/lib/api/transactions'

export const useTransactions = (page = 1, period = "30") =>
  useQuery({
    queryKey: ["transactions", page, period],
    queryFn: () => fetchTransactions(page, period),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
export const useTransactionStats = (period = "30") =>
  useQuery({
    queryKey: ["transaction-stats", period],
    queryFn: () => fetchTransactionStats(period),
    staleTime: 1000 * 60 * 2,
  });
 
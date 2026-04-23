'use client'
import React, { useState } from 'react'
import { useTransactions, useTransactionStats } from '@/lib/query/transactions'
import { TransactionFull } from '@/components/transactions/transactionFull'
import TransactionEmpty from '@/components/transactions/transactionEmpty'
import { TransactionSkeleton } from '@/components/common/skeleton'
import { toast } from 'sonner'

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState("30");

  const { data, isLoading, isError } = useTransactions(page, period);
  const { data: stats, isLoading: statsLoading } = useTransactionStats(period);
  
  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;

  React.useEffect(() => {
    if (isError) toast.error('Failed to load transactions');
  }, [isError]);

  if (isLoading || statsLoading) return <TransactionSkeleton />;
  if (!transactions.length && page === 1) return <TransactionEmpty />;

  return (
    <TransactionFull
      transactions={transactions}
      stats={stats}
      page={page}
      total={total}
      period={period}
      onPageChange={setPage}
      onPeriodChange={(p) => {
        setPeriod(p);
        setPage(1);
      }}
    />
  );
}
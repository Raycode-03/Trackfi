'use client'
import React, { useState } from "react";
import { useEffect } from 'react'
import { WatchlistEmpty } from './sections/watchlistEmpty'
import { WatchlistFull } from './sections/watchlistFull'
import { WatchlistSkeleton } from '../common/skeleton'
import { useWatchlist, useWatchlistStats } from '@/lib/query/index'
import { toast } from 'sonner'

function WatchlistPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useWatchlist(page);
  const { data: stats, isLoading: statsLoading } = useWatchlistStats();

  const coins = data?.coins ?? [];
  const total = data?.total ?? 0;
  useEffect(() => {
    if (isError) toast.error("Failed to load watchlist.");
  }, [isError]);

  if (isLoading || statsLoading) return <WatchlistSkeleton />;

  const isEmpty = coins.length === 0 && page === 1;
  return isEmpty ? (
    <WatchlistEmpty />
  ) : (
    <WatchlistFull
      coins={coins}
      stats={stats}
      page={page}
      total={total}
      onPageChange={setPage}
    />
  );
}

export default WatchlistPage;
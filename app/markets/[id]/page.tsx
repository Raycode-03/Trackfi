'use client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useCoinDetail } from '@/lib/query/index'
import CoinDetailView from '@/components/markets/coinDetailsView'
import { CoinDetailSkeleton } from '@/components/common/skeleton'

export default function CoinDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: coin, isLoading , isError} = useCoinDetail(id)
  useEffect(() => {
    if(isError) {
      toast.error("Failed to load coin details.");
    }
  },[isError]);

  if (isLoading) return <CoinDetailSkeleton />

  return <CoinDetailView coin={coin ?? undefined} id={id} />
}
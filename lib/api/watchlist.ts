import { WatchlistCoin, WatchlistStats } from '@/types/index'

export async function fetchWatchlist(page = 1): Promise<{ coins: WatchlistCoin[]; total: number; page: number; limit: number }> {
  const res = await fetch(`/api/watchlist?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch watchlist");
  return res.json();
}
export async function fetchWatchlistStats(): Promise<WatchlistStats> {
  const res = await fetch('/api/watchlist/stats')
  if (!res.ok) throw new Error('Failed to fetch watchlist stats')
  return res.json()
}

export async function toggleWatchlistStar(
  coinId: string, 
  starred: boolean,  
  coinName: string, 
  coinSymbol: string,
  coinImage: string
) {
  const res = await fetch(`/api/watchlist/${coinId}/star`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ starred, coinName, coinSymbol, coinImage }),
  })
  if (!res.ok) throw new Error('Failed to toggle watchlist star')
  return res.json()
}

export async function toggleWatchlistAlert(coinId: string, alert: { type: 'price' | 'percentage'; value: number } | null) { 
  const res = await fetch(`/api/watchlist/${coinId}/alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( alert ),
  })
  if (!res.ok) throw new Error('Failed to toggle watchlist alert')
  return res.json()
}
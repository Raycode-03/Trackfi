// lib/helpers/watchlistExport.ts
import { WatchlistCoin } from '@/types/index'

export function exportWatchlistToCSV(coins: WatchlistCoin[]) {
  const headers = [
    'Name',
    'Symbol',
    'holdings (USD)',
    'Price (USD)',
    '24H Change %',
    '7D Change %',
    'Market Cap (USD)',
    'Watchlisted',
    'Has Alert',
  ]

  const rows = coins.map(c => [
    c.name,
    c.symbol,
    c.holdings != null ? c.holdings.toFixed(2) : '0.00',
    c.current_price,
    `${c.price_change_percentage_24h.toFixed(2)}%`,
    `${c.price_change_percentage_7d.toFixed(2)}%`,
    c.market_cap,
    c.isWatchlisted ? 'Yes' : 'No',
    c.hasAlert ? 'Yes' : 'No',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `trackfi-watchlist-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
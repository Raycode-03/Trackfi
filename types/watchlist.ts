export interface WatchlistStats {
  totalValue: number
  totalChangePercent: number
  topPerformer: { symbol: string; changePercent: number }
  marketSentiment: { label: string; score: number }
}

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  market_cap: number;
  sparkline: number[];
}
export interface WatchlistCoin extends MarketCoin {
  isWatchlisted: boolean;
  hasAlert: boolean;
  holdings?: number;
  holdingsValue?: number | null;
  holdingsValueChange24h?: number | null;
}

export interface ChartPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export type TimeRange = "1D" | "1W" | "1M" | "1Y";

export interface CoinDetail extends MarketCoin {
  total_volume: number;
  ath: number;
  ath_change_percentage: number;
  circulating_supply: number;
  max_supply: number | null;
  description: string;
}

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

export interface Alert {
  id: string;
  user_id: string;
  coin_id: string;
  condition: "above" | "below";
  target_price: number;
  status: string;
  triggered_recently?: boolean;
  last_price?: number;
}

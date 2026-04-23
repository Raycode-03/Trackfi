export type TransactionType =
  | "buy"
  | "sell"
  | "swap"
  | "deposit"
  | "withdrawal";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  date: string;
  coin: string;
  symbol: string;
  type: TransactionType;
  amount: number;
  price: number;
  total_value: number;
  status: TransactionStatus;
  network?: string;
  coin_id: string;
  coin_name?: string | null;
  coin_image?: string | null;
  current_price?: number | null;
  current_value?: number | null;
  unrealized_pnl?: number | null;
}

export interface TransactionStats {
  total: number;
  totalVolumeBought: number;
  totalVolumeSold: number;
  boughtChange: number;
  soldChange: number;
  buyOrders: number;
  sellOrders: number;
  networkStatus: string;
}

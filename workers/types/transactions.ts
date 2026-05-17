export interface BlockstreamTx {
  txid: string;
  vout: { scriptpubkey_address: string; value: number }[];
  vin: { prevout: { scriptpubkey_address: string; value: number } }[];
  status: { confirmed: boolean; block_time: number };
}

export interface HeliusTx {
  signature: string;
  timestamp: number;
  transactionError: null | object;
  type: string;
  tokenTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
  }[];
  nativeTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
}

export interface MoralisTx {
  hash: string;
  from_address: string;
  to_address: string;
  value: string;
  block_timestamp: string;
  receipt_status: string;
  native_price?: { usd_price: number };
}

export interface TransactionRow {
  user_id: string;
  coin_id: string;
  symbol: string;
  type: "deposit" | "withdrawal";
  amount: number;
  price: number;
  total_value: number;
  status: "completed" | "failed";
  network: string;
  date: string;
  tx_hash: string;
}

export interface EvmChainMeta {
  moralisChain: string;
  coin_id: string;
  symbol: string;
}

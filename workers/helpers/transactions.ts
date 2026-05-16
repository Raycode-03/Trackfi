import {
  TransactionRow,
  EvmChainMeta,
  MoralisTx,
  HeliusTx,
  BlockstreamTx,
} from "../types/transactions";
export function mapEvmTx(
  tx: MoralisTx,
  walletAddress: string,
  userId: string,
  meta: EvmChainMeta,
  provider: string,
): TransactionRow {
  const isSend = tx.from_address?.toLowerCase() === walletAddress.toLowerCase();
  const amount = Number(tx.value) / 1e18;
  const price = tx.native_price?.usd_price ?? 0;
  return {
    user_id: userId,
    coin_id: meta.coin_id,
    symbol: meta.symbol,
    type: isSend ? "withdrawal" : "deposit",
    amount,
    price,
    total_value: amount * price,
    status: tx.receipt_status === "1" ? "completed" : "failed",
    network: provider,
    date: new Date(tx.block_timestamp).toISOString(),
    tx_hash: tx.hash,
  };
}

export function mapBtcTx(
  tx: BlockstreamTx,
  walletAddress: string,
  userId: string,
): TransactionRow {
  const receivedValue = tx.vout
    .filter((o) => o.scriptpubkey_address === walletAddress)
    .reduce((sum, o) => sum + o.value, 0);

  const sentValue = tx.vin
    .filter((i) => i.prevout?.scriptpubkey_address === walletAddress)
    .reduce((sum, i) => sum + i.prevout.value, 0);

  const isSend = sentValue > 0;
  const amount = (isSend ? sentValue - receivedValue : receivedValue) / 1e8;

  return {
    user_id: userId,
    coin_id: "bitcoin",
    symbol: "BTC",
    type: isSend ? "withdrawal" : "deposit",
    amount: Math.abs(amount),
    price: 0,
    total_value: 0,
    status: tx.status.confirmed ? "completed" : "failed",
    network: "bitcoin",
    date: new Date(tx.status.block_time * 1000).toISOString(),
    tx_hash: tx.txid,
  };
}

export function mapSolTx(
  tx: HeliusTx,
  walletAddress: string,
  userId: string,
): TransactionRow | null {
  // Only handle TRANSFER type for now
  if (tx.type !== "TRANSFER") return null;

  // Check native SOL transfers first
  const nativeSend = tx.nativeTransfers.find(
    (t) => t.fromUserAccount === walletAddress,
  );
  const nativeReceive = tx.nativeTransfers.find(
    (t) => t.toUserAccount === walletAddress,
  );

  if (nativeSend || nativeReceive) {
    const transfer = nativeSend || nativeReceive!;
    const amount = transfer.amount / 1e9;
    return {
      user_id: userId,
      coin_id: "solana",
      symbol: "SOL",
      type: nativeSend ? "withdrawal" : "deposit",
      amount,
      price: 0,
      total_value: 0,
      status: tx.transactionError === null ? "completed" : "failed",
      network: "solana",
      date: new Date(tx.timestamp * 1000).toISOString(),
      tx_hash: tx.signature,
    };
  }

  // Token transfers
  const tokenSend = tx.tokenTransfers.find(
    (t) => t.fromUserAccount === walletAddress,
  );
  const tokenReceive = tx.tokenTransfers.find(
    (t) => t.toUserAccount === walletAddress,
  );
  const transfer = tokenSend || tokenReceive;
  if (!transfer) return null;

  return {
    user_id: userId,
    coin_id: "solana",
    symbol: "SOL",
    type: tokenSend ? "withdrawal" : "deposit",
    amount: transfer.tokenAmount,
    price: 0,
    total_value: 0,
    status: tx.transactionError === null ? "completed" : "failed",
    network: "solana",
    date: new Date(tx.timestamp * 1000).toISOString(),
    tx_hash: tx.signature,
  };
}
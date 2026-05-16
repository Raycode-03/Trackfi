import type { MoralisTx, BlockstreamTx, HeliusTx } from "../types";

export async function fetchEvm(
  walletAddress: string,
  moralisChain: string,
): Promise<MoralisTx[]> {
  const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/history?chain=${moralisChain}&limit=80`;
  const res = await fetch(url, {
    headers: { "X-API-Key": process.env.MORALIS_API_KEY! },
  });
  const json = await res.json();
  return json.result ?? [];
}

export async function fetchBtc(
  walletAddress: string,
): Promise<BlockstreamTx[]> {
  const res = await fetch(
    `https://blockstream.info/api/address/${walletAddress}/txs`,
  );
  return res.json();
}

export async function fetchSol(walletAddress: string): Promise<HeliusTx[]> {
  const res = await fetch(
    `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${process.env.HELIUS_API_KEY}&limit=100`,
  );
  return res.json();
}

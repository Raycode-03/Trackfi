import { Integration } from "@/types/settings";

export const defaultIntegrations: Integration[] = [
  {
  id: "int_001",
  provider: "ethereum",  // lowercase to match CHAINS map in worker
  name: "Ethereum",
  status: "disconnected",
  description: "Connect your Ethereum address to sync on-chain transactions",
  icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  walletAddress: null,
},
{
  id: "int_002",
  provider: "bitcoin",
  name: "Bitcoin",
  status: "disconnected",
  description: "Connect your Bitcoin address to import transactions",
  icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  walletAddress: null,
},
{
  id: "int_003",
  provider: "solana",
  name: "Solana",
  status: "disconnected",
  description: "Connect your Solana wallet to sync transactions",
  icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  walletAddress: null,
},
 {
    id: "int_004",
    provider: "metamask",
    name: "MetaMask",
    status: "coming_soon",
    description: "Connect your MetaMask wallet to automatically sync Ethereum transactions",
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    walletAddress: null,
  },
]
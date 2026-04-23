import { Integration } from "@/types/settings";

export const defaultIntegrations: Integration[] = [
  {
    id: "int_001",
    provider: "metamask",
    name: "MetaMask",
    status: "disconnected",
    description: "Connect your MetaMask wallet to sync on-chain transactions",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    walletAddress:null,
  },
  {
    id: "int_002",
    provider: "trustwallet",
    name: "Trust Wallet",
    status: "disconnected",
    description: "Connect your Trust Wallet to import transactions",
      icon: "https://assets.coingecko.com/coins/images/11085/small/Trust.png",
    walletAddress: null,
  },
  {
    id: "int_003",
    provider: "binance",
    name: "Binance",
    status: "coming_soon", // ← flag it as coming soon
    description: "Connect your Binance account to sync trades",
    icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    walletAddress:null,
  },
];
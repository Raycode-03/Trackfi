// lib/mock/coinDetail.ts
import { CoinDetail } from '@/types/markets'

function generateChartData(basePrice: number, points: number, volatility: number) {
  const data = []
  let price = basePrice * 0.85
  const now = Date.now()
  const interval = (points === 24 ? 3600 : points === 7 ? 86400 : points === 30 ? 86400 : 86400 * 12) * 1000
  for (let i = points; i >= 0; i--) {
    const open = price
    price = price + (Math.random() - 0.48) * volatility
    const close = Math.max(price, basePrice * 0.5)
    const swing = volatility * 0.3
    data.push({
      date: new Date(now - i * interval).toISOString(),
      value: close,
      open,
      high: Math.max(open, close) + Math.random() * swing,
      low: Math.min(open, close) - Math.random() * swing,
      volume: Math.random() * 1_000_000_000 + 500_000_000,
    })
  }
  return data
}

function makeCoin(base: Omit<CoinDetail, 'chartData' | 'sparkline'> & { basePrice: number; volatility: number }): CoinDetail {
  const { basePrice, volatility, ...rest } = base
  return {
    ...rest,
    sparkline: Array.from({ length: 7 }, (_, i) => basePrice * (0.9 + i * 0.02)),
    chartData: {
      '1D': generateChartData(basePrice, 24, volatility * 0.1),
      '1W': generateChartData(basePrice, 7, volatility * 0.3),
      '1M': generateChartData(basePrice, 30, volatility),
      '1Y': generateChartData(basePrice, 52, volatility * 2),
    }
  }
}

export const mockCoinDetails: Record<string, CoinDetail> = {
  bitcoin: makeCoin({
    id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', image: '',
    current_price: 64281.40, price_change_percentage_24h: 2.45, price_change_percentage_7d: 12.2,
    market_cap: 1_260_000_000_000, total_volume: 28_000_000_000,
    ath: 69000, ath_change_percentage: -6.9,
    circulating_supply: 19_500_000, max_supply: 21_000_000,
    description: 'Bitcoin is the first decentralized cryptocurrency, originally described in a 2008 whitepaper by Satoshi Nakamoto.',
    basePrice: 64281, volatility: 2000,
  }),
  // ethereum: makeCoin({
  //   id: 'ethereum', name: 'Ethereum', symbol: 'ETH', image: '',
  //   current_price: 3452.12, price_change_percentage_24h: -0.84, price_change_percentage_7d: -2.33,
  //   market_cap: 414_900_000_000, total_volume: 14_200_000_000,
  //   ath: 4878, ath_change_percentage: -29.2,
  //   circulating_supply: 120_000_000, max_supply: null,
  //   description: 'Ethereum is a decentralized platform that runs smart contracts and is the foundation for most DeFi and NFT applications.',
  //   basePrice: 3452, volatility: 200,
  // }),
  solana: makeCoin({
    id: 'solana', name: 'Solana', symbol: 'SOL', image: '',
    current_price: 148.90, price_change_percentage_24h: -12.4, price_change_percentage_7d: -18.2,
    market_cap: 66_400_000_000, total_volume: 3_100_000_000,
    ath: 260, ath_change_percentage: -42.7,
    circulating_supply: 445_000_000, max_supply: null,
    description: 'Solana is a high-performance blockchain supporting fast, low-cost transactions and a growing ecosystem of DeFi and NFT projects.',
    basePrice: 148, volatility: 15,
  }),
  ripple: makeCoin({
    id: 'ripple', name: 'XRP', symbol: 'XRP', image: '',
    current_price: 0.612, price_change_percentage_24h: -2.18, price_change_percentage_7d: -1.05,
    market_cap: 33_600_000_000, total_volume: 1_200_000_000,
    ath: 3.84, ath_change_percentage: -84.1,
    circulating_supply: 54_000_000_000, max_supply: 100_000_000_000,
    description: 'XRP is a digital asset built for global payments, enabling fast and low-cost cross-border transactions.',
    basePrice: 0.612, volatility: 0.05,
  }),
  binancecoin: makeCoin({
    id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB', image: '',
    current_price: 584.20, price_change_percentage_24h: -1.15, price_change_percentage_7d: -0.42,
    market_cap: 87_100_000_000, total_volume: 1_800_000_000,
    ath: 686, ath_change_percentage: -14.8,
    circulating_supply: 149_000_000, max_supply: 200_000_000,
    description: 'BNB is the native token of the Binance ecosystem, used for trading fee discounts and powering the BNB Chain.',
    basePrice: 584, volatility: 30,
  }),
}
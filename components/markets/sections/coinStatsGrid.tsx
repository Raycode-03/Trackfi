import { CoinDetail } from "@/types/markets";
import { formatCurrency } from "@/lib/helpers/formatPrice";

interface CoinStatsGridProps {
  coin: CoinDetail;
}

interface Stat {
  label: string;
  value: string;
  type?: "positive" | "negative" | "neutral";
}

export function CoinStatsGrid({ coin }: CoinStatsGridProps) {
  const stats: Stat[] = [
    {
      label: "Market Cap",
      value: `$${(coin.market_cap / 1e9)?.toFixed(2)}B`,
    },
    {
      label: "24H Volume",
      value: `$${(coin.total_volume / 1e9)?.toFixed(2)}B`,
    },
    { label: "All Time High", value: formatCurrency(coin.ath) },
    {
      label: "ATH Change",
      value: `${coin.ath_change_percentage?.toFixed(2)}%`,
      type: coin.ath_change_percentage >= 0 ? "positive" : "negative",
    },
    {
      label: "Circulating Supply",
      value: `${(coin.circulating_supply / 1e6)?.toFixed(2)}M`,
    },
    {
      label: "Max Supply",
      value: coin.max_supply ? `${(coin.max_supply / 1e6)?.toFixed(2)}M` : "∞",
    },
    {
      label: "7D Change",
      value: `${coin.price_change_percentage_7d >= 0 ? "+" : ""}${coin.price_change_percentage_7d?.toFixed(2)}%`,
      type: coin.price_change_percentage_7d >= 0 ? "positive" : "negative",
    },
    {
      label: "Dominance",
      value: `${((coin.market_cap / 1_260_000_000_000) * 100)?.toFixed(1)}%`,
    },
  ];

  const valueColor = (type?: Stat["type"]) => {
    if (type === "positive") return "text-green-400";
    if (type === "negative") return "text-red-400";
    return "text-white";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
            {stat.label}
          </p>
          <p className={`text-sm font-semibold ${valueColor(stat.type)}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
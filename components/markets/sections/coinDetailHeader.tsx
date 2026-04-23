import { ArrowUpRight, ArrowDownRight, Star, Bell } from "lucide-react";
import { CoinDetail } from "@/types/markets";
import { formatCurrency } from "@/lib/helpers/formatPrice";

const coinColors: Record<string, { bg: string; text: string }> = {
  BTC: { bg: "bg-orange-500/20", text: "text-orange-400" },
  ETH: { bg: "bg-blue-500/20", text: "text-blue-400" },
  SOL: { bg: "bg-purple-500/20", text: "text-purple-400" },
  BNB: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  XRP: { bg: "bg-sky-500/20", text: "text-sky-400" },
  ADA: { bg: "bg-teal-500/20", text: "text-teal-400" },
};
const defaultColor = { bg: "bg-white/10", text: "text-white/60" };

interface CoinDetailHeaderProps {
  coin: CoinDetail;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  onOpenAlert: () => void;
}

export function CoinDetailHeader({
  coin,
  isWatchlisted,
  onToggleWatchlist,
  onOpenAlert,
}: CoinDetailHeaderProps) {
  const isPositive = coin.price_change_percentage_24h >= 0;
  const color = coinColors[coin.symbol] ?? defaultColor;

  return (
    <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${color.bg} ${color.text}`}
        >
          {coin.symbol?.slice(0, 3)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-white">{coin.name}</h1>
            <span className="text-white/40 text-lg">{coin.symbol}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-bold">
              {formatCurrency(coin.current_price)}
            </span>
            <span
              className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-lg ${isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {isPositive ? "+" : ""}
              {coin.price_change_percentage_24h?.toFixed(2)}% 24h
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onToggleWatchlist}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
            isWatchlisted
              ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
              : "border-white/10 text-white/60 hover:text-white hover:border-white/20"
          }`}
        >
          <Star
            className={`w-4 h-4 ${isWatchlisted ? "fill-yellow-400" : ""}`}
          />
          {isWatchlisted ? "Watchlisted" : "Add to Watchlist"}
        </button>
        <button
          onClick={onOpenAlert}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          Set Alert
        </button>
      </div>
    </div>
  );
}

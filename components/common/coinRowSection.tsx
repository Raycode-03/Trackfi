"use client";
import React from "react";
import { ArrowUpRight, ArrowDownRight, Star, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/helpers/formatPrice";
import { WatchlistCoin } from "@/types/index";
import Image from "next/image";
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline
        points={pts}
        stroke={positive ? "#4ade80" : "#f97066"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function fmtMarketCap(n: number) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function Pct({ value }: { value: number }) {
  if (value == null || isNaN(value))
    return <span className="text-sm text-white/30">—</span>;
  const pos = value >= 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-sm font-medium ${pos ? "text-green-400" : "text-red-400"}`}
    >
      {pos ? (
        <ArrowUpRight className="w-3.5 h-3.5" />
      ) : (
        <ArrowDownRight className="w-3.5 h-3.5" />
      )}
      {pos ? "+" : ""}
      {value?.toFixed(2)}%
    </span>
  );
}

const coinColors: Record<string, { bg: string; text: string }> = {
  BTC: { bg: "bg-orange-500/20", text: "text-orange-400" },
  ETH: { bg: "bg-blue-500/20", text: "text-blue-400" },
  SOL: { bg: "bg-purple-500/20", text: "text-purple-400" },
  BNB: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  XRP: { bg: "bg-sky-500/20", text: "text-sky-400" },
  ADA: { bg: "bg-teal-500/20", text: "text-teal-400" },
  DOGE: { bg: "bg-amber-500/20", text: "text-amber-400" },
  MATIC: { bg: "bg-violet-500/20", text: "text-violet-400" },
};
const defaultColor = { bg: "bg-white/10", text: "text-white/60" };

interface CoinRowProps {
  coin: WatchlistCoin;
  onToggleStar: (id: string) => void;
  onToggleAlert: (id: string) => void;
  showHoldings?: boolean;
}

export function CoinRowSection({
  coin,
  onToggleStar,
  onToggleAlert,
  showHoldings = false,
}: CoinRowProps) {
  const router = useRouter();
  const color = coinColors[coin.symbol] ?? defaultColor;
  console.log(coin, "coins from markets to details ", coin.id);
  return (
    <tr
      className="border-t border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
      onClick={() => router.push(`/markets/${coin.id}`)}
    >
      <td className="py-4 pl-2 pr-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0 ${color.bg}`}
          >
            {coin.image ? (
              <Image
                src={coin.image}
                alt={coin.name}
                width={36}
                height={36}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.removeAttribute("hidden");
                }}
              />
            ) : null}

            <span hidden className={`text-xs font-bold ${color.text}`}>
              {coin?.symbol?.slice(0, 3)}
            </span>
          </div>
          <div>
            <p
              className="text-sm font-semibold text-white truncate max-w-[120px]"
              title={coin.name}
            >
              {coin.name}
            </p>
            <p className="text-xs text-white/40">{coin.symbol}</p>
          </div>
        </div>
      </td>

      <td className="py-4 pr-4 md:table-cell">
        <p className="text-sm font-medium text-white whitespace-nowrap">
          {formatCurrency(coin.current_price)}
        </p>
      </td>

      {showHoldings && (
        <td className="py-4 pr-4">
          <p className="text-sm font-medium text-white">
            {coin.holdings != null ? (
              `${coin.holdings} ${coin.symbol.toUpperCase()}`
             ) : (
        <span className="text-white/40 text-xs">No holdings</span>
      )}
          </p>
          {coin.holdings != null && (
            <p className="text-xs text-white/40">
              {formatCurrency(coin.holdings * coin.current_price)}
            </p>
          )}
        </td>
      )}

      <td className="py-4 pr-4">
        <Pct value={coin.price_change_percentage_24h} />
      </td>

      <td className="py-4 pr-4 hidden md:table-cell">
        <Pct value={coin.price_change_percentage_7d} />
      </td>

      <td className="py-4 pr-4 hidden lg:table-cell">
        <p className="text-sm text-white/70 whitespace-nowrap">
          {fmtMarketCap(coin.market_cap)}
        </p>
      </td>

      <td className="py-4 pr-4 hidden lg:table-cell">
        {coin.sparkline?.length > 1 && (
          <Sparkline
            data={coin.sparkline}
            positive={coin.price_change_percentage_7d >= 0}
          />
        )}
      </td>
      {/* Actions */}
      <td className="py-4 pr-2">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(coin.id);
            }}
            title ="Add to Watchlist"
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Star
              className={`w-4 h-4 transition-colors ${coin.isWatchlisted ? "text-yellow-400 fill-yellow-400" : "text-white/20 hover:text-yellow-400"}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleAlert(coin.id);
            }}
            title='Add Alert'
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Bell
              className={`w-4 h-4 transition-colors ${coin.hasAlert ? "text-primary fill-primary/20" : "text-white/20 hover:text-primary"}`}
            />
          </button>
        </div>
      </td>
    </tr>
  );
}

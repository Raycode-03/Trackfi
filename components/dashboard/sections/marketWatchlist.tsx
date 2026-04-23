"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Star,
} from "lucide-react";
import { MarketCoinItem } from "@/types/dashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function MarketWatchlist({ market }: { market: MarketCoinItem[] }) {
  const router = useRouter();
  const [watchlisted, setWatchlisted] = useState<Set<string>>(new Set());
  const toggleWatchlist = (id: string) => {
    setWatchlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const coinColors: Record<string, { bg: string; text: string }> = {
    BTC: { bg: "bg-orange-500/20", text: "text-orange-400" },
    ETH: { bg: "bg-blue-500/20", text: "text-blue-400" },
    BNB: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
    SOL: { bg: "bg-purple-500/20", text: "text-purple-400" },
    ADA: { bg: "bg-sky-500/20", text: "text-sky-400" },
    T: { bg: "bg-pink-500/20", text: "text-pink-400" },
  };

  const defaultColor = { bg: "bg-primary/10", text: "text-white/60" };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Market Watchlist</h2>
        <Link
          href="/watchlist"
          className="text-sm text-primary hover:underline"
        >
          View All Markets
        </Link>
      </div>

      {market.length === 0 ? (
        <p className="text-white/40 text-sm text-center py-8">
          No market data yet
        </p>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6"> 
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="text-xs text-white/40 uppercase tracking-wider">
              <th className="text-left pb-4 font-medium">Asset</th>
              <th className="text-left pb-4 font-medium">Price</th>
              <th className="text-left pb-4 font-medium">24H Change</th>
              <th className="text-left pb-4 font-medium">Holding</th>
              <th className="text-left pb-4 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {market.map((coin) => {
              const isPositive = coin.price_change_percentage_24h >= 0;
              const isWatchlisted = watchlisted.has(coin.id);
              const symbol = coin.symbol.toUpperCase()?.slice(0, 3);
              const color = coinColors[symbol] ?? defaultColor;

              return (
                <tr
                  key={coin.id}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors"
                  onClick={() => router.push(`/watchlist?coin=${coin.id}`)}
                >
                  {/* Asset */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Star
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWatchlist(coin.id);
                              }}
                              className={`cursor-pointer transition-colors ${
                                isWatchlisted
                                  ? "w-4 h-4 text-yellow-400 fill-yellow-400"
                                  : "w-4 h-4 text-white/20 hover:text-yellow-400"
                              }`}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {isWatchlisted
                              ? "Remove from watchlist"
                              : "Add to watchlist"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div
                        className={`w-9 h-9 rounded-full  flex items-center justify-center text-xs font-bold ${color.bg} ${color.text} shrink-0`}
                      >
                        {symbol}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{coin.name}</p>
                        <p className="text-xs text-white/40">
                          {coin.symbol}/USD
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4">
                    <p className="text-sm font-medium">
                      ${coin.current_price.toLocaleString()}
                    </p>
                  </td>

                  {/* 24H Change */}
                  <td className="py-4">
                    <span
                      className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {isPositive ? "+" : ""}
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </td>

                  {/* Holding */}
                  <td className="py-4">
                    <p className="text-sm font-medium">
                      {coin.holdings} {coin.symbol}
                    </p>
                    <p className="text-xs text-white/40">
                      ${(coin.holdings * coin.current_price).toLocaleString()}
                    </p>
                  </td>

                  {/* Trend */}
                  <td className="py-4">
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

export default MarketWatchlist;

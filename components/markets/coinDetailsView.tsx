"use client"
import React, { useCallback, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { CoinDetail, TimeRange } from "@/types/markets";
import { CandlestickChart } from "../common/CandleStickChart";
import { SetAlertModal } from "../shared/modals/setAlertModal";
import { CoinNotAvailable } from "./sections/coinNotAvailable";
import { CoinDetailHeader } from "./sections/coinDetailHeader";
import { CoinStatsGrid } from "./sections/coinStatsGrid";

interface Props {
  coin?: CoinDetail;
  id: string;
}

export default function CoinDetailView({ coin, id }: Props) {
  const [range, setRange] = useState<TimeRange>("1M");
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleRangeChange = useCallback((newRange: TimeRange) => {
    setRange(newRange);
  }, []);

  if (!coin) return <CoinNotAvailable />;

  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white">
      <Link
        href="/markets"
        className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Markets
      </Link>

      <CoinDetailHeader
        coin={coin}
        isWatchlisted={isWatchlisted}
        onToggleWatchlist={() => setIsWatchlisted((p) => !p)}
        onOpenAlert={() => setShowAlertModal(true)}
      />

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white/80">Price Chart</h2>
          <div className="flex gap-1">
            {(["1D", "1W", "1M", "1Y"] as TimeRange[]).map((t) => (
              <button
                key={t}
                onClick={() => handleRangeChange(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  range === t
                    ? "bg-primary text-black"
                    : "text-white/40 hover:text-white hover:bg-white/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Chart owns its own loading/fetching/pagination */}
        <CandlestickChart id={id} range={range} />
      </div>

      <CoinStatsGrid coin={coin} />

      {coin.description && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-base font-semibold mb-3">About {coin.name}</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            {coin.description}
          </p>
        </div>
      )}

      {showAlertModal && (
        <SetAlertModal
          coinSymbol={coin.symbol}
          coinPrice={coin.current_price}
          onClose={() => setShowAlertModal(false)}
          onCreate={(type, value) => {
            console.log(`Alert created: ${type} ${value}`);
          }}
        />
      )}
    </div>
  );
}
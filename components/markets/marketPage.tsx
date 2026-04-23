"use client";
import React, { useState, useEffect } from "react";
import CoinTable from "@/components/common/coinTable";
import { MarketsSkeleton } from "@/components/common/skeleton";
import { useMarkets } from "@/lib/query/index";
import { SetAlertModal } from "../shared/modals/setAlertModal";
import { toast } from "sonner";
import { AlertCondition, WatchlistCoin } from "@/types";
import { toggleWatchlistStar, toggleWatchlistAlert } from "@/lib/api";
function MarketPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useMarkets(page, search);
  const coins = data?.coins ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);
  const [coinList, setCoinList] = useState<WatchlistCoin[]>(coins);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  useEffect(() => {
    if (isError) {
      toast.error("Failed to load markets.");
    }
  }, [isError]);

  useEffect(() => {
    if (coins.length > 0) {
      setCoinList(coins);
    }
  }, [coins]);
  const toggleStar = (id: string) => {
    const coin = coinList.find((c) => c.id === id);
    if (!coin) return;
    const newState = !coin.isWatchlisted;
    setCoinList((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isWatchlisted: !c.isWatchlisted } : c,
      ),
    );
    toast.success(newState ? "Added to watchlist" : "Removed from watchlist");
    toggleWatchlistStar(
      id,
      !coin.isWatchlisted,
      coin.name,
      coin.symbol,
      coin.image ?? "",
    ).catch(() => {
      toast.error("Failed to update watchlist.");
      setCoinList((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isWatchlisted: coin.isWatchlisted } : c,
        ),
      );
    });
  };

  const toggleAlert = (id: string) => {
    setSelectedCoinId(id);
    setShowAlertModal(true);
  };

  const handleAlertCreate = (type: AlertCondition, value: number) => {
    if (!selectedCoinId) return;
    const coin = coinList.find((c) => c.id === selectedCoinId);
    setCoinList((prev) =>
      prev.map((c) => (c.id === selectedCoinId ? { ...c, hasAlert: true } : c)),
    );
    toast.success(`Alert set for ${coin?.symbol}`);
    toggleWatchlistAlert(selectedCoinId, {
      type: type === "change" ? "percentage" : "price",
      value,
    }).catch(() => {
      toast.error("Failed to create alert.");
      setCoinList((prev) =>
        prev.map((c) =>
          c.id === selectedCoinId ? { ...c, hasAlert: false } : c,
        ),
      );
    });
  };

  if (isLoading) return <MarketsSkeleton />;
  const selectedCoin = coinList.find((c) => c.id === selectedCoinId);
  return (
    <div className="pt-24 px-6 pb-10 min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Markets</h1>
        <p className="text-white/50 mt-1 text-sm">
          Live prices across 10,000+ assets.
        </p>
      </div>

      <CoinTable
        coins={coinList}
        title="All Markets"
        onToggleStar={toggleStar}
        onToggleAlert={toggleAlert}
        showExport={false}
        isServerPaginated={true}
        page={page}
        total={total}
        limit={20}
        onPageChange={setPage}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      {showAlertModal && selectedCoin && (
        <SetAlertModal
          coinSymbol={selectedCoin.symbol}
          coinPrice={selectedCoin.current_price}
          onClose={() => {
            setShowAlertModal(false);
            setSelectedCoinId(null);
          }}
          onCreate={handleAlertCreate}
        />
      )}
    </div>
  );
}

export default MarketPage;
